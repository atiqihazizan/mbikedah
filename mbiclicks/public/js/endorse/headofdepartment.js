"use strict";
var KTPending = {};
KTPending = (function () {
    var dt;
    var validDetail = true;
    const urlVerify = APP_URL + "activity/verify/";
    const urlPending = APP_URL + "activity/hod/pending";
    const reloadTable = async () => dt.ajax.reload();
    const initDatatable = function () {
        dt = kt_DT({
            procces: true,
            // server: true,
            len: 6,
            menu: [
                [6, 10, 25, 50, -1],
                [6, 10, 25, 50, "All"],
            ],
            el: "#kt_table_pending",
            url: urlPending,
            columns: [
                { data: "pdt" },
                {
                    data: "body",
                    render: (data) => text_truncate(data?.perkara || "", 100),
                },
                {
                    data: "staff.fullname",
                    render: (data) => toTitleCase(data),
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
                        if (data === 3)
                            return `<span class="badge badge-light-info fs-7 fw-bold">Dikembalikan</span>`;
                        return "";
                    },
                },
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
                { targets: [0, 1, 2, 3], orderable: false },
                { targets: [2, 3], className: "text-end" },
                {
                    targets: -1,
                    data: null,
                    orderable: false,
                    className: "text-end",
                },
            ],
            dataSrc: function (d) {},
            handleActionButton: handleActionButton,
        });
    };
    const handleActionButton = () => {
        $el(".btnVerify", true).forEach((button, index) => {
            button.addEventListener("click", async (e) => {
                const { loading, loadingDone } = pageLoading();
                loading();
                try {
                    const { slug } = dt.row(button.closest("tr")).data();
                    const res = await $.get(APP_URL + "activity/hod/" + slug);
                    const {
                        data,
                        staff,
                        html,
                        list: isDetail,
                        ptsts,
                        attach,
                    } = res;

                    e.stopImmediatePropagation();
                    e.preventDefault();
                    loadingDone();

                    // reset
                    $el(".reset").each((e) => (e.innerHTML = ""));

                    // prevent
                    if (res.error) return toastr.error(res.message);

                    $el("#petSts").innerHTML = "";
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
                    if (isDetail) listDetail(res, slug);

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

                    // verification or approval button
                    $el("#form-process").innerHTML = html;
                    $el(".btn-verify-submit").click((e) => verification());

                    fraPage("kt-overview-petition");
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
    const listDetail = function (rData, slug) {
        let el = $el("#tbody_details");
        let { stepper, list } = rData;
        if (!el) return;
        validDetail = true; // reset dulu validation
        el.innerHTML = list?.map((l, n) => trContent(l, n, stepper)).join("");
    };
    const trContent = (l, n, stepper) => {
        const tend = "text-end";
        const tcntr = "text-center";
        const { id: stpid } = stepper;
        const {
            budget: { code: bcode },
            verified: { code: vcode },
        } = l;
        let tr = "<tr>";
        if ("budget" in l) tr += "<td>" + bcode + "</td>";
        if ("cate" in l) tr += '<td class="">' + l.cate + "</td>";
        if ("item" in l) tr += '<td class="">' + l.item + "</td>";
        if ("desc" in l) tr += '<td class="">' + l?.desc + "</td>";
        if ("refe" in l) tr += '<td class="">' + l?.refe + "</td>";
        if ("unit" in l) tr += `<td class="${tcntr}">${l.unit}</td>`;
        if ("amnt" in l) tr += `<td class="${tend}">${currency(l.amnt)}</td>`;
        if ("total" in l) tr += `<td class="${tend}">${currency(l.total)}</td>`;
        tr += "</tr>";
        return tr;
    };
    const verification = () => {
        let slug = $(".kt_pt_slug").text();
        let fd = { _token: CSRF_TOKEN };

        $(".form_verify")
            .serializeArray()
            .forEach(function (frm) {
                if (frm.value != "") fd[frm.name] = frm.value;
            });

        if (validDetail.msg && (fd.psts == 3 || fd.psts == 5)) {
            swalErr(validDetail.msg);
            return false;
        }
        return $.put(urlVerify + slug, fd).done(function (res) {
            const { error, message } = res;
            if (error) return swalErr(message);
            if (typeof message === "object") console.log(res.message);
            if (res.success) {
                reloadTable().then(() => {
                    kt_main.notify();
                    fraPage("kt-table-petition");
                });
            }
        });
    };
    const addEventClick = function () {
        $el(".btnCancel").click((e) => fraPage("kt-table-petition"));
        $el('[name="activity_status"]').each((a) => {
            $(a).change((e) => {
                const { val } = e.target.dataset;
                if (parseInt(val) === 0) {
                    dt.ajax.url(APP_URL + "activity/hod/history").load();
                } else {
                    dt.ajax.url(urlPending).load();
                }
            });
        });
    };
    return {
        init: async function () {
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

            initDatatable();
            handleSearchDatatable();
            addEventClick();
        },
    };
})();
KTUtil.onDOMContentLoaded(() => KTPending.init());
