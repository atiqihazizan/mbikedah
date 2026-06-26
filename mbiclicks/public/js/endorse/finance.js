"use strict";
var KTPending = {};
KTPending = (function () {
    var dt;
    var tableEl;
    var overvwEl;
    var validDetail = true;
    var pstatus = 0;
    var pslug = "";
    var ptlist = [];
    const UrlVerify = APP_URL + "activity/verify/";
    const UrlFinance = APP_URL + "activity/finance/";
    const UrlPending = APP_URL + "activity/finance/pending";

    const reloadTable = async () => dt.ajax.reload();
    const initDatatable = function () {
        dt = kt_DT({
            procces: true,
            len: 6,
            menu: [
                [6, 10, 25, 50, -1],
                [6, 10, 25, 50, "All"],
            ],
            el: "#kt_table_pending",
            url: UrlPending,
            order: [[4, "desc"]],
            columns: [
                { data: "pdt" },
                {
                    data: "body",
                    render: (data) => text_truncate(data?.perkara || "", 100),
                },
                {
                    data: "tamt",
                    render: (data) => currency(data || 0),
                },
                {
                    data: "status",
                    render: (data) => {
                        if (data === 0)
                            return `<span class="badge badge-light-warning fs-7 fw-bold">Belum Pengesahan</span>`;
                        if (data === 1)
                            return `<span class="badge badge-light-success fs-7 fw-bold">Disahkan</span>`;
                        if (data === 2)
                            return `<span class="badge badge-light-danger fs-7 fw-bold">Ditolak</span>`;
                        return "";
                    },
                },
                { data: "stepdt", className: "text-center" },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<a href="#" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary btn-icon w-30px h-30px btnVerify">
<span class="svg-icon svg-icon-2">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
<path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642
12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642
5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533
15.4343 12.5657Z" fill="currentColor"></path>
</svg></span></a>`;
                    },
                },
            ],
            columnDefs: [
                { targets: [0, 1, 2, 3, 4], orderable: false },
                { targets: [2, 3], orderable: false, className: "text-end" },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: "text-end",
                },
            ],
            // dataSrc: (d) => console.log(d.data),
            handleActionButton: handleActionButton,
        });
    };
    const handleActionButton = () => {
        $el(".btnVerify", true).forEach((button, index) => {
            button.addEventListener("click", async (e) => {
                const { loading, loadingDone } = pageLoading();
                loading();
                try {
                    const { slug } = dt.row(button.closest("tr")).data(); //e.target.getAttribute('slug');
                    const res = await $.get(UrlFinance + slug);
                    const { data, staff, html, ptsts, attach, preview } = res;

                    loadingDone();
                    e.stopImmediatePropagation();
                    e.preventDefault();

                    // reset
                    $el(".reset").each((e) => (e.innerHTML = ""));
                    $el("#printout-body").innerHTML = "";

                    // prevent
                    if (res.error) return toastr.error(res.message);

                    if (preview) {
                        $el("#printout-body").innerHTML = preview;
                        fraPage("kt-preview-petition");
                        $el("#printout").click((e) =>
                            printClick("printout-body", "KPW_" + data.pcode)
                        );
                        return;
                    }
                    // status
                    $el("#petSts").textContent = "";
                    if (ptsts) $el("#petSts").innerHTML = ptsts;

                    // staff
                    for (const s in staff) {
                        let el = $(".staff-" + s);
                        if (el) dataTypeFormat($(el), staff[s]);
                    }
                    if (staff.avatar)
                        $($el("#avatar")).attr("src", staff.avatar);

                    // data
                    for (const d in data) {
                        let el = $el(".data-" + d);
                        if (el) el.textContent = data[d];
                    }

                    // details
                    listDetail(res, slug);

                    // attachment
                    if (attach)
                        $el("#tbody_attach").innerHTML = attach
                            ?.map(
                                ({ filename, path }) =>
                                    `<tr><td><a href="${
                                        APP_URL + "storage/" + path
                                    }" target="_blank" rel="noopener noreferrer">${filename}</a></td></tr>`
                            )
                            .join("");

                    // $el("#view-ulasan").textContent = ulasan ?? "";
                    // $el("#card-ulasan").style.display = ulasan
                    //     ? "block"
                    //     : "none";

                    // verification or approval button
                    $el("#form-process").innerHTML = html;
                    $("#add_bank_trans").on("click", addCredit);
                    $el(".btn-verify-submit").click((e) => verification());
                    fraPage("kt-overview-petition");
                    return;

                    $(overvwEl.querySelector(".btn-verified-payment")).on(
                        "click",
                        function (e) {
                            e.preventDefault();
                            paymentverify(res);
                        }
                    );
                } catch (e) {
                    loadingDone();
                    console.error(e);
                }
            });
        });
    };
    const handleSearchDatatable = function () {
        const filterSearch = document.querySelector(
            '[data-kt-docs-table-filter="search"]'
        );
        filterSearch.addEventListener("keyup", (e) => {
            dt.search(e.target.value).draw();
        });
    };
    const addCredit = function (e) {
        const slug = $(".kt_pt_slug").text();
        const credits = $("[name='body[credits]']");
        let obj = credits.val() || [];
        const total = parseFloat($(".kt_pt_total").text());
        const creditbank = parseInt($("#creditbank").val());
        const txamt = parseFloat($("#txamt").val());
        const url = APP_URL + "activity/finance/trans/credit/" + slug;
        const pd = {
            _token: CSRF_TOKEN,
            idbank: creditbank,
            amt: txamt,
        };

        e.preventDefault();
        if (typeof obj === "string") obj = JSON.parse(obj);
        if (isNaN(creditbank)) return toastr.error("Bank tidak pilih");
        if (isNaN(txamt) || txamt === 0)
            return toastr.error("Jumlah tidak dimasukkan");
        if (obj.find((o) => o.bankid === creditbank))
            return swaError("Bank sudah ada");

        const sum = obj.reduce((partialSum, a) => partialSum + a.total, txamt);
        if (total < sum)
            return swaError("Jumlah telah melebihi dari permohonan");

        const { loading, loadingDone } = pageLoading("form-process");
        loading();
        $.put(url, pd).then((d) => {
            loadingDone();
            if (d.error) return swaError(d.message);
            obj.push(d.data);
            $("#creditbank").val("");
            $("#txamt").val("");
            bankCredit(obj);
        });
    };
    const delCredit = (e) => {
        const credits = $("[name='body[credits]']");
        const idx = e.currentTarget.dataset.index * 1;
        const obj = JSON.parse(credits.val());
        const list = obj.filter((o, index) => idx !== index);
        bankCredit(list);
    };
    const bankCredit = function (credits) {
        let total = 0;
        $("[name='body[credits]']").val(JSON.stringify(credits));
        $("#tbody_bankcredit").html(
            credits
                .map((b, n) => {
                    let tr = "<tr>";
                    total += b.total;
                    tr += `<td>${b.text}</td>`;
                    tr += `<td class="text-end">${currency(b.total)}</td>`;
                    tr += `<td><button class="btn btn-icon btn-danger w-20px h-20px del_trans" data-index="${n}"><span class="fa fa-times"></span></button></td>`;
                    tr += "</tr>";
                    return tr;
                })
                .join("")
        );
        $("#totalcredit").text(currency(total));
        $("[name='body[creditverified]']").val(total);
        $(".del_trans").on("click", delCredit);
    };
    const listDetail = function (rData, slug) {
        let el = $el("#tbody_details");
        let { stepper, list } = rData;
        if (!el) return;
        ptlist = list;
        validDetail = true; // reset dulu validation
        el.innerHTML = list?.map((l, n) => trContent(l, n, stepper)).join("");

        $el("[kt-verify-budget]", true).each((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                let html =
                    '<select class="form-select" kt-confirm-budget data-placeholder="Pilih Bajet"><option value=""></option></select>';
                swaHtml(
                    "Pengesahan Bajet",
                    html,
                    function (e) {
                        let el = document.querySelector("[kt-confirm-budget]");
                        let sdata = $(el).select2("data") ?? [];
                        let url = UrlFinance + slug + "/plist";

                        if (sdata[0].id == "")
                            return Swal.showValidationMessage(
                                "Bajet tidak pilih"
                            );
                        list.forEach((r, n) => {
                            if (!r.verified.code) r.verified = "[]";
                            if (n == index)
                                r.verified =
                                    (({ id, code, name, text }) => ({
                                        id,
                                        code,
                                        name,
                                        text,
                                    }))(sdata[0]) ?? [];
                        });
                        return $.put(url, {
                            _token: CSRF_TOKEN,
                            plist: JSON.stringify(list),
                        }).then((res) => {
                            if (res.success) return res;
                            console.error(res);
                            return Swal.showValidationMessage(res.error);
                        });
                    },
                    {
                        didOpen: function () {
                            let el = document.querySelector(
                                "[kt-confirm-budget]"
                            );
                            let url = APP_URL + "conf/budget/getbudget";
                            customSelect2(el, ".swal2-modal", url);
                        },
                    }
                ).then((result) => {
                    if (result.isConfirmed) listDetail(result.value, slug);
                });
            });
        });
        $el("[kt-delete-action]", true).each((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                list.splice(index, 1);
                $.put(UrlFinance + slug + "/plist", {
                    _token: CSRF_TOKEN,
                    plist: JSON.stringify(list),
                    payment: 1,
                }).then((res) => listDetail(res, slug));
            });
        });
    };
    const trContent = (l, n, stepper) => {
        const tend = "text-end";
        const tcntr = "text-center";
        const { id: stpid } = stepper;
        const {
            budget: { code: bcode },
            verified: { code: vcode },
        } = l;
        let verifyTxt = "Perlu disahkan";
        let verifyClss = "danger";
        let verifyTR = "<td></td>";
        let tr = "<tr>";
        if ("budget" in l) tr += "<td>" + bcode + "</td>";
        if ("cate" in l) tr += '<td class="">' + l.cate + "</td>";
        if ("item" in l) tr += '<td class="">' + l.item + "</td>";
        if ("desc" in l) tr += '<td class="">' + l?.desc + "</td>";
        if ("refe" in l) tr += '<td class="">' + l?.refe + "</td>";
        if ("unit" in l) tr += `<td class="${tcntr}">${l.unit}</td>`;
        if ("amnt" in l) tr += `<td class="${tend}">${currency(l.amnt)}</td>`;
        if ("total" in l) tr += `<td class="${tend}">${currency(l.total)}</td>`;
        if ("budget" in l && "allow" in l) {
            if (l.allow && l.allow.find((f) => f == stpid) && stpid == 5) {
                // pegawai kewangan
                if (vcode) {
                    verifyClss = "primary";
                    verifyTxt = vcode;
                } else {
                    validDetail = {
                        msg: "Bajet dalam butiran perlu disahkan dahulu",
                    };
                }
                verifyTR = `<td class="${tend} w-75px">
                        <a href="#" class="badge badge-light-${verifyClss}" kt-verify-budget idx="${n}">${verifyTxt}</a></td>`;
            } else {
                if (l.verified.code)
                    verifyTR = `<td class="${tend}">${l.verified.code}</td>`;
            }
            tr += verifyTR;
        }
        if ("vtype" in l && "verified" in l) {
            tr += `<td class="${tend} text-nowrap">${l.verified}</td>`;
        }
        tr += "</tr>";
        return tr;
    };
    const verification = () => {
        let slug = $(".kt_pt_slug").text();
        let fd = { _token: CSRF_TOKEN };
        const { loading, loadingDone } = pageLoading();

        $(".form_verify")
            .serializeArray()
            .forEach(function (frm) {
                if (frm.value != "") {
                    fd[frm.name] = frm.value;
                }
            });

        if (validDetail.msg && (fd.psts == 3 || fd.psts == 5)) {
            swalErr(validDetail.msg);
            return false;
        }

        try {
            loading();
            return $.put(UrlVerify + slug, fd)
                .done(function (res) {
                    loadingDone();
                    const { error, message, preview } = res;
                    if (error) return swalErr(message);
                    if (typeof message === "object") console.log(res.message);
                    if (res.success) {
                        reloadTable().then(() => {
                            kt_main.notify();
                            if (preview) {
                                $el("#printout-body").innerHTML = preview;
                                printClick("printout-body", "Bayaran");
                                fraPage("kt-table-petition");
                            } else {
                                fraPage("kt-table-petition");
                            }
                        });
                    }
                })
                .fail(() => loadingDone());
            /* .always(function () {
                    loadingDone();
                }); */
        } catch (e) {
            loadingDone();
        }
    };
    const paymentverify = function (res) {
        // const now = new Date().toLocaleDateString();
        const currDate = new Date().toJSON().slice(0, 10);
        const html = `<form id="swaform">
        <label class="form-label">Rujukan Pembayaran</label>
        <input type="text" class="form-control" name="ref" placeholder="Rujukan pembayaran"><br>
        <label class="form-label">Tarikh Serahan</label>
        <input type="date" class="form-control" name="pdate" placeholder="Tarikh serahan" max="${currDate}" value="${currDate}">
        </form>`;
        swaHtml(
            "Pengesahan Pembayaran",
            html,
            (e) => {
                let { ref, pdate } = $el("#swaform");

                if (ref.value.length < 3)
                    return Swal.showValidationMessage(
                        "Sila masukkan rujukan pembayaran"
                    );
                if (pdate.value.length < 3)
                    return Swal.showValidationMessage(
                        "Sila masukkan rujukan pembayaran"
                    );

                const fd = {
                    _token: CSRF_TOKEN,
                    psts: res.endorse_sts,
                    data: {
                        ref: ref.value,
                        pdt: pdate.value,
                    },
                };
                const { slug } = res.ptt;

                return $.put(UrlVerify + slug, fd).done(function (respone) {
                    if (!respone.success || respone.error) {
                        Swal.showValidationMessage(respone.message);
                        return console.error(respone);
                    }
                    return true;
                });
            },
            { custbtn: "Selesai" }
        ).then((res) => {
            if (!res.isConfirmed) return;
            reloadTable().then(() => {
                kt_main.notify();
                fraPage("kt-table-petition");
            });
        });
    };
    const detailpayment = function (res, slug) {
        let obj = ptlist ?? [];
        let item = document.getElementById("itemname").value;
        let budgetEl = $("#itembudget").select2("data") ?? [];
        let budget =
            (({ id, code, name, text }) => ({ id, code, name, text }))(
                budgetEl[0]
            ) ?? {};
        let data = {
            budget: budget,
            refe: document.getElementById("itemref").value,
            unit: document.getElementById("itemunit").value,
            amnt: document.getElementById("itemamt").value,
            item: item,
            slug: MD5(
                item.replaceAll(" ", "").toLowerCase().trim() + budget.code
            ),
            del: "slug",
            allow: [3, 5], // action pada step pgw kewangan dan HR
            verified: [],
        };

        try {
            if (budget.id === "") throw "Bajet tidak pilih";
            if (data.item.length === 0) throw "Perkara diperlukan";
            if (isNaN(parseInt(data.unit)) || data.unit == 0)
                throw "Unit diperlukan";
            if (isNaN(parseInt(data.amnt)) || data.amnt == 0)
                throw "Harga diperlukan";
            data.total = parseFloat(data.amnt) * parseFloat(data.unit);
            data.unit = parseFloat(data.unit);
            data.amnt = parseFloat(data.amnt);
            obj.push(data);
            $.put(UrlFinance + slug + "/plist", {
                _token: CSRF_TOKEN,
                plist: JSON.stringify(obj),
                payment: 1,
            }).then((res) => listDetail(res, slug));
        } catch (e) {
            console.log(data, ptlist, obj);
            swaError(e);
        }
    };
    const addEventClick = function () {
        $el(".btnCancel").each((b) => {
            $el(b).click((e) => fraPage("kt-table-petition"));
        });
        $el('[name="activity_status"]').each((a) => {
            $(a).change((e) => {
                const { val } = e.target.dataset;
                if (parseInt(val) === 0) {
                    dt.ajax.url(UrlFinance + "history").load();
                } else {
                    dt.ajax.url(UrlPending).load();
                }
            });
        });
    };
    return {
        init: async function () {
            let res = await $.get(APP_URL + "activity/finance/budgetremider");
            let data = res.message;
            toastr.options = {
                closeButton: true,
                timeOut: 6000,
                showDuration: 500,
                hideDuration: 1000,
                newestOnTop: false,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
            };
            data.forEach((a, n) => setTimeout(() => toastr.error(a), n * 1000));

            tableEl = $el("#kt-table-petition");
            initDatatable();
            handleSearchDatatable();
            addEventClick();
        },
    };
})();
KTUtil.onDOMContentLoaded(() => KTPending.init());
