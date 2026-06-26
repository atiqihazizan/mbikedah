"use strict";
var KTPending = {};
KTPending.main = (function () {
    var dt;
    var tableEl;
    var overvwEl;
    var validDetail = true;
    var pstatus = 0;
    var pslug = "";
    var ptlist = [];

    const initDatatable = function () {
        dt = kt_DT({
            len: 6,
            menu: [
                [6, 10, 25, 50, -1],
                [6, 10, 25, 50, "All"],
            ],
            el: "#kt_table_pending",
            url: APP_URL + "activity/pending/data",
            order: [[4, "desc"]],
            columns: [
                { data: "ptype.name" },
                {
                    data: "body",
                    render: (data, type, row) =>
                        text_truncate(data?.perkara || "", 100),
                },
                {
                    data: "depart.name",
                    render: (data, type, { stepper: { name } }) =>
                        toTitleCase(data),
                },
                {
                    data: "stepper.name",
                    render: (data) =>
                        `<span class="badge badge-light-success fs-7 fw-bold">${data}</span>`,
                },
                { data: "stepdt", className: "text-center" },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `<a href="#" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary btn-icon w-30px h-30px" data-kt-actions="verify">
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
                { targets: [0, 1, 2, 3], orderable: false },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: "text-end",
                },
            ],
            dataSrc: function (d) {
                // console.log(d.data);
            },
            handleActionButton: handleActionButton,
        });
    };
    const reloadTable = () => dt.ajax.reload();
    const handleActionButton = () => {
        $el('[data-kt-actions="verify"]', true).forEach((button, index) => {
            button.addEventListener("click", async (e) => {
                let data = dt.row(button.closest("tr")).data();
                let slug = data.slug; //e.target.getAttribute('slug');
                let res = await $.get(APP_URL + "activity/" + slug);
                let staff = {};

                e.stopImmediatePropagation();
                e.preventDefault();

                if (res.error) return toastr.error(res.message);
                // if(res.error){swalErr(res.message,null);return;}
                if (res.preview) {
                    pslug = res.ptt.slug;
                    pstatus = res.endorse_sts;
                    $el("#printout-body").innerHTML = res.preview;
                    fraPage("kt-printout-petition");
                    return;
                }
                if (res.staff) staff = res.staff;
                if (staff.avatar)
                    $(overvwEl.querySelector("#avatar")).attr(
                        "src",
                        staff.avatar
                    );
                if (res.pcate && res.pcate == 1)
                    document
                        .querySelector('[data-kt-type="humanresources"]')
                        .classList.add("d-none");
                if (res.pcate && res.pcate == 2)
                    document
                        .querySelector('[data-kt-type="humanresources"]')
                        .classList.remove("d-none");
                if (res.html)
                    $(overvwEl.querySelector("#kt_modal_body")).html(res.html);
                if (res.title)
                    $(overvwEl.querySelector(".attn-name")).html(res.title);
                if (res.depart)
                    $(overvwEl.querySelector(".staff-depart")).html(
                        toTitleCase(res.depart)
                    );
                if (res.position)
                    $(overvwEl.querySelector(".staff-position")).html(
                        toTitleCase(res.position)
                    );

                for (const s in staff) {
                    let el = overvwEl.querySelector(".staff-" + s);
                    if (!el) {
                        continue;
                    }
                    dataTypeFormat($(el), staff[s]);
                }

                listDetail(res, slug);
                leaves(res, overvwEl);
                if (res.stepper.id == 5) bankCredit(res.credits ?? [], slug);

                $(overvwEl.querySelector(".btn-verify-submit")).on(
                    "click",
                    function (e) {
                        e.preventDefault();
                        verification(res.title, res.verify);
                    }
                );
                $(overvwEl.querySelector(".btn-verified-payment")).on(
                    "click",
                    function (e) {
                        e.preventDefault();
                        paymentverify(res);
                    }
                );
                $(overvwEl.querySelector(".add-detail")).on(
                    "click",
                    function (e) {
                        e.preventDefault();
                        detailpayment(res, slug);
                    }
                );
                $(overvwEl.querySelector("#add_bank_trans")).on(
                    "click",
                    function (e) {
                        e.preventDefault();
                        let creditbank = parseInt($("#creditbank").val());
                        let txamt = parseFloat($("#txamt").val());
                        let url = APP_URL + "activity/trans/credit/" + slug;
                        let pd = {
                            _token: CSRF_TOKEN,
                            idbank: creditbank,
                            amt: txamt,
                        };

                        console.log(creditbank);
                        if (isNaN(txamt))
                            return toastr.error("Jumlah tidak dimasukkan");

                        if (isNaN(creditbank))
                            return toastr.error("Bank tidak pilih");

                        $.put(url, pd).then((d) => {
                            if (d.error) return swaError(d.message);
                            bankCredit(d.data, slug);
                        });
                    }
                );
                // initialize
                customSelect2(
                    document.getElementById("itembudget"),
                    "body",
                    APP_URL + "conf/budget/getbudget",
                    { width: "style" }
                );

                // view page after complete proses data
                fraPage("kt-overview-petition");
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
    const bankCredit = function (credits, slug) {
        let total = 0;
        $("#tbody_bankcredit").html(
            credits
                .map((b, n) => {
                    let tr = "<tr>";
                    total += b.total;
                    tr += `<td>${b.text}</td>`;
                    tr += `<td class="text-end">${currency(b.total)}</td>`;
                    tr += `<td><button class="btn btn-icon btn-danger w-30px h-30px del_trans" idx="${n}"><span class="fa fa-times"></span></button></td>`;
                    tr += "</tr>";
                    return tr;
                })
                .join("")
        );
        $("#totalcredit").text(currency(total));

        $("#tbody_bankcredit .del_trans").on("click", (evt) => {
            let idx = evt.target.getAttribute("idx");
            let url = APP_URL + "activity/trans/uncredit/" + slug;
            let pd = { _token: CSRF_TOKEN, idx: idx };
            evt.preventDefault();
            $.put(url, pd).then((res) => {
                if (res.error) return swaError(res.message);
                bankCredit(res.data, slug);
            });
        });
    };
    const leaves = function (res) {
        let el = overvwEl.querySelector("[kt-leave-list]");
        let lve = res.leave ?? [];
        if (!el) return;
        el.innerHTML = lve
            .map(function (l) {
                let objEl = overvwEl
                    .querySelector("[kt-leave-data]")
                    .cloneNode(true);
                const lvname = l.leave_type.leave;
                const take = l.basic - l.limit;
                const max = l.basic;
                const percent = (take / max) * 100;
                const fix = percent.toFixed(0);
                objEl.querySelector("[kt-leave-name]").innerHTML = lvname;
                objEl.querySelector(
                    "[kt-leave-percent]"
                ).innerHTML = `${take}/${max}`; //fix + '%';
                objEl.querySelector("[kt-leave-bar]").style.width = fix + "%";
                return objEl.innerHTML;
            })
            .join("");
    };
    const listDetail = function (rData, slug) {
        let el = overvwEl.querySelector("table tbody.kt_table_plist");
        let list = rData.list ? rData.list : [];
        let stp = rData.stepper ?? {};

        if (!el) return;
        ptlist = list;
        validDetail = true; // reset dulu validation
        el.innerHTML = list
            .map(function (l, n) {
                let verifyTxt = "Perlu disahkan";
                let verifyClss = "danger";
                let verifyTR = "<td></td>";
                let tr = "<tr>";
                if ("budget" in l)
                    tr += '<td class="">' + l.budget.code + "</td>";
                if ("cate" in l) tr += '<td class="">' + l.cate + "</td>";
                if ("item" in l) tr += '<td class="">' + l.item + "</td>";
                if ("desc" in l) tr += '<td class="">' + l.desc + "</td>";
                if ("refe" in l)
                    tr +=
                        l.refe == null
                            ? "<td></td>"
                            : '<td class="">' + l.refe + "</td>";
                if ("unit" in l)
                    tr += '<td class="text-center">' + l.unit + "</td>";
                if ("amnt" in l)
                    tr += '<td class="text-end">' + currency(l.amnt) + "</td>";
                if ("total" in l)
                    tr += '<td class="text-end">' + currency(l.total) + "</td>";
                if ("budget" in l && "allow" in l) {
                    if (
                        l.allow &&
                        l.allow.find((f) => f == stp.id) &&
                        stp.id == 5
                    ) {
                        // pegawai kewangan
                        if (l.verified.code) {
                            verifyClss = "primary";
                            verifyTxt = l.verified.code;
                        } else {
                            validDetail = {
                                msg: "Bajet dalam butiran perlu disahkan dahulu",
                            };
                        }
                        verifyTR = `<td class="text-end"><a href="javascript:;" class="badge badge-light-${verifyClss}" kt-verify-budget idx="${n}">${verifyTxt}</a></td>`;
                    } else if (
                        l.allow &&
                        l.allow.find((f) => f == stp.id) &&
                        stp.id == 3
                    ) {
                        // pegawai HR
                        verifyTR = `<td class="text-end"><a class="btn btn-icon btn-sm btn-danger w-25px h-25px" kt-delete-action idx="${n}"><i class="fa fa-times"></i></a></td>`;
                    } else {
                        if (l.verified.code)
                            verifyTR = `<td class="text-end">${l.verified.code}</td>`;
                    }
                    tr += verifyTR;
                }
                if ("vtype" in l && "verified" in l) {
                    if (stp.id == 3) {
                        // pegawai HR
                        if (l.vtype === "car") {
                            if (l.verified) {
                                verifyClss = "primary";
                                verifyTxt = l.verified;
                            } else {
                                validDetail = {
                                    msg: "Kenderaan perlu disahkan dahulu",
                                };
                            }
                            verifyTR = `<td class="text-end"><a href="javascript:;" class="badge badge-light-${verifyClss}" kt-verify-car idx="${n}">${verifyTxt}</a></td>`;
                        } else if (l.vtype === "necessary") {
                            if (l.verified) {
                                verifyClss = "primary";
                                verifyTxt = l.verified;
                            } else {
                                validDetail = {
                                    msg: "Keperluan perlu disahkan dahulu",
                                };
                            }
                            verifyTR = `<td class="text-end"><a href="javascript:;" class="badge badge-light-${verifyClss}" kt-verify-necessary idx="${n}">${verifyTxt}</a></td>`;
                        }
                    } else if (stp.id > 3) {
                        verifyTR = `<td class="text-end text-nowrap">${l.verified}</td>`;
                    }
                    tr += verifyTR;
                }
                tr += "</tr>";
                return tr;
            })
            .join("");

        el.querySelectorAll("[kt-verify-budget]").forEach((v) => {
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
                        let url = APP_URL + "petition/" + slug + "/plist";

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
        el.querySelectorAll("[kt-verify-car]").forEach((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                let html =
                    '<select class="form-select" kt-confirm-car data-placeholder="Pilih Kenderaan"><option value=""></option></select>';
                swaHtml(
                    "Pengesahan Kenderaan",
                    html,
                    function (e) {
                        let el = document.querySelector("[kt-confirm-car]");
                        let sdata = $(el).select2("data") ?? [];
                        let url = APP_URL + "petition/" + slug + "/plist";

                        if (sdata[0].id == "")
                            return Swal.showValidationMessage(
                                "Kenderaan tidak pilih"
                            );

                        list.forEach((r, n) => {
                            if (n == index) {
                                // r.verified = (({id, text}) => ({id, text}))(sdata[0]) ?? [];
                                r.verified = sdata[0].text;
                                r.verified_idcar = parseInt(sdata[0].id);
                            }
                        });
                        return $.put(url, {
                            _token: CSRF_TOKEN,
                            plist: JSON.stringify(list),
                        }).then((res) => {
                            if (res.success) return res;
                            return Swal.showValidationMessage(res.error);
                        });
                    },
                    {
                        didOpen: function () {
                            let el = document.querySelector("[kt-confirm-car]");
                            let url = APP_URL + "asset/available";
                            customSelect2(el, ".swal2-modal", url);
                        },
                    }
                ).then((result) => {
                    if (result.isConfirmed) listDetail(result.value, slug);
                });
            });
        });
        el.querySelectorAll("[kt-verify-necessary]").forEach((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                swaTextOnly(
                    "Maklumat untuk rujukan",
                    "",
                    "Kemaskini",
                    (txt) => {
                        let url = APP_URL + "petition/" + slug + "/plist";
                        if (txt.length < 1)
                            return Swal.showValidationMessage(
                                "Masukkan sebarang maklumat untuk rujukan"
                            );
                        list.forEach((r, n) => {
                            if (n == index) r.verified = txt;
                        });

                        return $.put(url, {
                            _token: CSRF_TOKEN,
                            plist: JSON.stringify(list),
                        }).then((res) => {
                            if (res.success) return res;
                            console.error(res);
                            return Swal.showValidationMessage(res.error);
                        });
                    }
                ).then((result) => {
                    if (result.isConfirmed) listDetail(result.value, slug);
                });
            });
        });
        el.querySelectorAll("[kt-delete-action]").forEach((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                list.splice(index, 1);
                $.put(APP_URL + "petition/" + slug + "/plist", {
                    _token: CSRF_TOKEN,
                    plist: JSON.stringify(list),
                    payment: 1,
                }).then((res) => listDetail(res, slug));
            });
        });
    };
    const verification = function (title, html) {
        swaHtml(
            title,
            html,
            function (e) {
                let form = document.querySelector(".form_verify");
                let slug = $(".kt_pt_slug").text();
                let fd = { _token: CSRF_TOKEN };

                $(form)
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
                return $.put(APP_URL + "activity/verify/" + slug, fd).done(
                    function (res) {
                        if (res.success) return true;
                        if (typeof res.message === "object")
                            console.log(res.message);
                        return Swal.showValidationMessage(res.message);
                    }
                );
            },
            { width: 500 }
        ).then((res) => {
            if (!res.isConfirmed) return;
            reloadTable();
            kt_main.notify();
            fraPage("kt-table-petition");
        });
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

                return $.put(APP_URL + "activity/verify/" + slug, fd).done(
                    function (respone) {
                        if (!respone.success || respone.error) {
                            Swal.showValidationMessage(respone.message);
                            return console.error(respone);
                        }
                        return true;
                    }
                );
            },
            { custbtn: "Selesai" }
        ).then((res) => {
            if (!res.isConfirmed) return;
            reloadTable();
            kt_main.notify();
            fraPage("kt-table-petition");
        });
        /* swaTextOnly("Rujukan pembayaran", "Disahkan", function (text) {
            let fd = {
                _token: CSRF_TOKEN,
                psts: res.endorse_sts,
                ref: text,
            };
            return $.put(APP_URL + "activity/verify/" + res.ptt.slug, fd).done(
                function (res) {
                    if (!res.success || res.error) {
                        Swal.showValidationMessage(res.message);
                        return console.error(res);
                    }
                    return true;
                }
            );
        }).then((result) => {
            if (!result.isConfirmed) return;
            reloadTable();
            kt_main.notify();
            fraPage("kt-table-petition");
        }); */
    };
    const detailpayment = function (res, slug) {
        // let listEl = document.getElementById('plist')
        // let plistVal = res.plist;
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
            // if(plistVal.indexOf(data.slug) != -1) throw item + ' untuk bajet ' + budget.code + ' sudah ditambah'
            // if(plistVal.length > 0) obj = JSON.parse(plistVal)
            data.total = parseFloat(data.amnt) * parseFloat(data.unit);
            data.unit = parseFloat(data.unit);
            data.amnt = parseFloat(data.amnt);
            obj.push(data);
            // listEl.value = JSON.stringify(obj)
            // listEl.dispatchEvent(new Event('change'));
            $.put(APP_URL + "petition/" + slug + "/plist", {
                _token: CSRF_TOKEN,
                plist: JSON.stringify(obj),
                payment: 1,
            }).then((res) => listDetail(res, slug));
        } catch (e) {
            console.log(data, ptlist, obj);
            swaError(e);
            // toastr.error(e)
        }
    };
    const addEventClick = function () {
        $(".btn-verify-cancel").on("click", function (e) {
            e.preventDefault();
            fraPage("kt-table-petition");
        });
        $("#printout").on("click", function (e) {
            e.preventDefault();
            let txType, html;
            let arType = [
                { id: 1, name: "Cek", val: PAY_TYPE_CHEQUE },
                { id: 2, name: "Online", val: PAY_TYPE_ONLINE },
            ];

            txType = arType
                .map((t) => {
                    return `<div class="form-check form-check-inline">
<input class="form-check-input" type="radio" name="typetrans" id="typetrans${t.id}" value="${t.val}">
<label class="form-check-label" for="typetrans${t.id}">${t.name}</label></div>`;
                })
                .join("");

            html = `<form id="form_transac" autocomplete="off" onsubmit="event.preventDefault();" class="pt-3">
<div class="fv-row mb-5">${txType}</div>
<div class="fv-row mb-5"><label for="" class="form-label">Rujukan</label><input type="text" class="form-control" name="refer"></div>
<div class="fv-row"><label for="" class="form-label">Ulasan</label><input type="text" class="form-control" name="remark"></div>
</form>`;
            swaHtml("Maklumat Transaksi Bayaran", html, (e) => {
                let form = document.getElementById("form_transac");
                let formSerial = $(form).serializeArray();
                let param = formSerial.reduce(
                    (k, v) => ({ ...k, [v.name]: v.value }),
                    {}
                );
                param.psts = pstatus;
                param._token = CSRF_TOKEN;
                return $.put(APP_URL + "activity/verify/" + pslug, param).done(
                    function (res) {
                        if (!res.success || res.error) {
                            Swal.showValidationMessage(res.message);
                            return console.error(res);
                        }
                        if (res.success) return true;
                    }
                );
            }).then((res) => {
                if (!res.isConfirmed) return;
                printClick("printout-body", "Bayaran");
                reloadTable();
                kt_main.notify();
                fraPage("kt-table-petition");
            });
        });
    };
    return {
        init: async function () {
            let res = await $.get(APP_URL + "activity/warning");
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
            data.forEach((a, n) =>
                setTimeout(function () {
                    toastr.error(a);
                }, n * 1000)
            );

            overvwEl = document.getElementById("kt-overview-petition");
            tableEl = document.getElementById("kt-table-petition");
            initDatatable();
            handleSearchDatatable();
            addEventClick();
        },
        redraw: reloadTable,
    };
})();
KTUtil.onDOMContentLoaded(() => KTPending.main.init());
function taskDaily(res, modalElActive) {
    let el = modalElActive.querySelector("table tbody.kt_table_taskdetail");
    let task = res.taskdetail ?? [];
    if (!el) return;
    el.innerHTML = task
        .map((t, n) => {
            return `<tr>
            <td class="text-center">${moment(t.tarikh).format(
                "DD-MM-YYYY"
            )}</td>
            <td class="text-center">${t.masastart}-${t.masaend}</td>
            <td class="text-center">${t.days}</td>
            <td>${t.perkara}</td>
            <td class="text-center">${t.jarak} km</td>
        </tr>`;
        })
        .join("");
}
function formVerification(modalElActive, step, data, body) {
    let el = modalElActive.querySelector(".form_verify_" + step.code);
    if (!el) return;
    let num = el.querySelector('[name="jumconfirm"]');
    if (body.num && num) num.value = body.num;
    if (body.totalamt && num) num.value = body.totalamt;
    if (data.tamt > 0 && num) num.value = data.tamt;
    // if(data.pcate == 1 && data.bid>0)$(el.querySelector('[name="budget"]')).val(data.bid).trigger('change');
}
