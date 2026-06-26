"use strict";
var KTPetition = {};
KTPetition.main = (function () {
    var dt;
    var fraData;
    var fraView;
    var form;
    var validations;
    var existJS = [];
    var validDetail = true;
    var basicValidation = {
        pdate: {
            validators: {
                notEmpty: { message: "Tarikh permohonan diperlukan" },
            },
        },
        // staff_id: {validators: {notEmpty: {message: 'Nama permohon diperlukan'}}}
    };

    var initDatatable = function () {
        dt = kt_DT({
            // procces:true,
            server: true,
            el: "#kt_table_petition",
            url: APP_URL + "petition/getall",
            // order: [[0, 'desc']],
            columns: [
                { data: "pdt" },
                {
                    data: "ptype.name",
                    render: function (data, type, row) {
                        return data;
                        // let sts = '';
                        // if(row.needclaim) sts = '<span class="ms-2 badge badge-danger fw-bold">Bersedia untuk tuntutan</span>';
                        // else if(row.psts == 1) sts = '<span class="ms-2 badge badge-light-secondary">Draf</span>'
                        // else if(row.psts == 2) sts = '<span class="ms-2 badge badge-light-primary">Dalam proses</span>';
                        // else if(row.psts == 3) sts = '<span class="ms-2 badge badge-light-success">Selesai</span>'
                        // else if(row.psts == 5) sts = '<span class="ms-2 badge badge-light-danger">Batal</span>'
                        // return data + sts
                    },
                },
                {
                    data: null,
                    render: function (data, type, { body }) {
                        if (body?.perkara) return body.perkara;
                        if (body?.reason) return body.reason;
                        return "";
                    },
                },
                { data: "stepper.description" },
                { data: "outstanding" },
                {
                    data: null,
                    render: function (data, type, row) {
                        let sts = row.psts;
                        if (APP_AUTH !== row.created_id) sts = 0;
                        if (row.claimid > 0 && [1, 5].includes(sts)) {
                            return `<a href="javascript:;" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px" data-kt-docs-table-filter="edit_row">
<i class="fa fa-pencil"></i>
</a>`;
                        } else if ([1, 5].includes(sts)) {
                            return `<a href="#" class="btn btn-sm btn-icon" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end"><i class="bi bi-three-dots fs-5"></i></a>
                        <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4" data-kt-menu="true">
                            <div class="menu-item px-3"><a href="#" class="menu-link px-3" data-kt-docs-table-filter="edit_row">Edit</a></div>
                            <div class="menu-item px-3"><a href="#" class="menu-link px-3" data-kt-docs-table-filter="delete_row">Delete</a></div>
                        </div>`;
                        } else {
                            return `<a href="javascript:;" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px" data-kt-docs-table-filter="overview">
                    <span class="svg-icon svg-icon-2"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
                        <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75
                        18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25
                        5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z" fill="currentColor"></path>
                        </svg>
                    </span>
                </a>`;
                        }
                    },
                },
            ],
            columnDefs: [
                { targets: 0, orderable: false, className: "text-center" },
                { targets: 1, orderable: false },
                { targets: 4, orderable: false, className: "text-end" },
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
    var handleActionButton = function () {
        const buttons = docEl('[data-kt-docs-table-filter="overview"]', true);
        buttons.forEach((button, index) => {
            eClick(button, (e) => {
                let data = dt.row(button.closest("tr")).data();
                // let list = data.plist;
                // let body = data.body;
                let slug = data.slug;
                e.stopImmediatePropagation();
                e.preventDefault();
                $.get(APP_URL + "petition/" + slug).done(function (res) {
                    if (res.error) {
                        swalErr(res.message, res);
                        return;
                    }
                    // var  psts = res.psts
                    let overviewbody = $(
                        fraView.querySelector("#kt_modal_body")
                    ).html(res.html)[0];
                    data.psts = res.psts; // re-status semula kepada status claim
                    fraPage("kt-overview-petition");
                    listDetail(data, overviewbody, slug);
                    returnCar(res, overviewbody, slug);
                    tripComplete(data, overviewbody, slug);
                    claim(overviewbody, slug);

                    $el('[data-bs-toggle="tooltip"]', true).map(
                        (tooltipTriggerEl) =>
                            new bootstrap.Tooltip(tooltipTriggerEl)
                    );
                });
            });
        });
        const btnEdit = docEl('[data-kt-docs-table-filter="edit_row"]', true);
        btnEdit.forEach((b, n) => {
            eClick(b, (e) => {
                let data = dt.row(b.closest("tr")).data();
                e.stopImmediatePropagation();
                e.preventDefault();

                // document.querySelector('[name="plist"]').value = '';
                $.get(APP_URL + "petition/" + data.slug + "/edit", (res) =>
                    initForm(res)
                );
            });
        });
        const btnDel = docEl('[data-kt-docs-table-filter="delete_row"]', true);
        btnDel.forEach((b, n) => {
            eClick(b, (e) => {
                let data = dt.row(b.closest("tr")).data();
                e.stopImmediatePropagation();
                e.preventDefault();

                let url = APP_URL + "petition/" + data.slug;
                let c = confirm("Anda pasti hendak buang permohonan ini?");
                if (!c) return;
                $.post(url, { _method: "delete", _token: CSRF_TOKEN })
                    .done(function (res, status) {
                        if (res.success) dt.ajax.reload();
                    })
                    .fail((err) => console.log(err));
            });
        });
    };
    var initAction = function () {
        docEl("[kt-button-new-action]", true).forEach((m) => {
            eClick(m, function (e) {
                let typid = e.target.getAttribute("kt-button-new-action"),
                    pd = { ptype: typid };
                e.preventDefault();
                $.get(APP_URL + "petition/create", pd, (res) => initForm(res));
            });
        });
        eKeyUp('[data-kt-docs-table-filter="search"]', (e) =>
            dt.search(e.target.value).draw()
        );
        eClick(".btn-show-table", (e) => {
            e.preventDefault();
            fraPage("kt-table-petition");
            dt.columns.adjust().draw();
        });
    };
    var initForm = function (res) {
        let slug = res.slug ?? "";
        docEl("#kt-form-petition-title").innerText = res.type.name;
        form.innerHTML = res.html;

        // customSelect2(form.staff_id,'body',APP_URL+'staff/getdata')
        eClick('[data-kt-stepper-action="home"]', (e) => {
            e.preventDefault();
            fraPage("kt-table-petition");
            dt.columns.adjust().draw();
        });
        eClick('[data-kt-stepper-action="save"]', function (e) {
            e.preventDefault();
            let agreed = document.getElementById("agreedtosend");
            update(res.js).then((e) => {
                if (e.success && agreed.checked) submit();
            });
        });
        $(form.querySelector(".attachment")).on("change", function (e) {
            let slug = form.querySelector('[name="pttid"]').value;
            let file = this;
            let ufile = file.files[0];
            let filePath = file.value;
            let url = APP_URL + "petition/" + slug + "/addattach";
            let fd = new FormData();

            fd.append("attach", file.files[0]);
            fd.append("_token", CSRF_TOKEN);

            file.value = null;
            var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
            if (!allowedExtensions.exec(filePath)) {
                swalErr(
                    "Muatnaik fail hendaklah dalam format [pdf,jpeg,jpg,png]",
                    null
                );
                // alert('Please upload file having extensions .jpeg or .jpg or .png or .pdf only.');
                return false;
            }
            //convert to megabyte
            let t = (ufile.size / 1024 / 1024).toFixed(1);
            if (t > 2) {
                swalErr("Saiz fail tidak boleh melebihi dari 2MB", null);
                return;
            }

            fetch(url, { method: "POST", body: fd })
                .then(function (res) {
                    return res.json();
                })
                .then(function (data) {
                    if (data.fails)
                        swalErr("Muatnaik dokumen tidak berjaya", data.fails);
                    if (data.success) tbodyAttach(data.success, slug);
                });
        });
        if (res.slug)
            $.get(
                APP_URL + "petition/" + slug + "/getattach",
                function (data, status) {
                    if (data.success) tbodyAttach(data.success, slug);
                }
            );
        if (res.js) {
            if (!existJS.includes(res.js)) {
                var s = document.createElement("script");
                s.type = "text/javascript";
                s.src = APP_URL + "js/app/" + res.js + ".js";
                document.body.appendChild(s);
                existJS.push(res.js);
            }
            loadValidity(res.js);
        }
        fraPage("kt-form-petition");
    };
    var update = async function (code) {
        let slug = form.querySelector('[name="pttid"]').value;
        let url = APP_URL + "petition";
        let dp = $(form).serialize();
        let aggreed = form.querySelectorAll(".editable.d-none");

        if (slug.length > 1) {
            url = APP_URL + "petition/" + slug;
            dp += "&_method=PUT";
            if (slug.length <= 50)
                return swalErr(
                    "Maaf, Permohohan tidak berjaya disimpan",
                    "invalid slug : " + slug
                );
        }

        // re-validation
        var field = $.extend({}, basicValidation, KTPetition[code].validity());
        var regField = validations.getFields();
        if (regField) {
            for (const regFieldKey in regField) {
                validations.removeField(regFieldKey);
            }
        }
        for (const key in field) {
            validations.addField(key, field[key]);
        }
        //
        let fv = await validations.validate();
        if (fv !== "Valid") return false;
        formBtnToggle("save", true);
        return $.post(url, dp)
            .done(function (res, status) {
                formBtnToggle("save", false);
                try {
                    if (!res.success) throw res;
                    form.querySelector('[name="pttid"]').value = res.id;
                    // dt.ajax.reload();
                    aggreed.forEach((e) => e.classList.remove("d-none"));
                    return true;
                } catch (e) {
                    if (!e.error) return true;
                    swalErr(Object.values(e.error).join(","), e);
                    return false;
                }
            })
            .fail(function (err) {
                formBtnToggle("save", false);
                swalErr("Rekod tidak berjaya simpan", err.responseJSON);
                return false;
            });
    };
    var submit = function () {
        let slug = form.querySelector('[name="pttid"]').value;
        let url = APP_URL + "petition/" + slug + "/submit";
        let dp = $(form).serialize();
        swaConfirm(
            "Anda pasti?",
            "Permohonan yang dihantar tidak boleh diubah lagi",
            "Ya, hantar"
        ).then((res) => {
            if (res.isConfirmed) {
                if (slug.length <= 50)
                    return swalErr(
                        "Maaf, Permohohan tidak berjaya hantar",
                        "Error slug invalid"
                    );
                formBtnToggle("save", true);
                $.post(url, dp)
                    .done(function (res, status) {
                        formBtnToggle("save", false);
                        try {
                            if (!res.success) throw res;
                            fraPage("kt-table-petition");
                            dt.columns.adjust().draw();
                            dt.ajax.reload();
                        } catch (e) {
                            if (e.error)
                                swalErr(Object.values(e.error).join(","), e);
                        }
                    })
                    .fail(function (err) {
                        formBtnToggle("save", false);
                        swalErr(
                            "Maaf, Permohonan tidak berjaya dihantar",
                            err.responseJSON
                        );
                    });
            }
        });
    };
    var claim = function (button, slug) {
        const btnClaim = button.querySelector(".btn-trip-claim");
        if (!btnClaim) return;
        btnClaim.addEventListener("click", (b) => {
            let html = "";
            let tr = "";
            b.stopImmediatePropagation();
            b.preventDefault();
            // showPageLoading("Tunggu sebentar...");
            $.post(APP_URL + "petition/" + slug + "/claim", {
                _token: CSRF_TOKEN,
            }).done((claim) => {
                // hidePageLoading();
                if (claim.error) {
                    Swal.showValidationMessage("Proses tidak berjaya");
                    return console.error(claim);
                }
                initForm(claim);
            });
        });
    };
    var returnCar = function (data, button, slug) {
        const btnReturn = button.querySelector(".btn-return-car");
        const url = APP_URL + "activity/verify/" + slug;

        if (!btnReturn) return;
        btnReturn.addEventListener("click", (b) => {
            b.stopImmediatePropagation();
            b.preventDefault();
            swaHtml(
                "Pemulangan Kenderaan",
                data.verify,
                function () {
                    let form = document.getElementById("swalForm");
                    let fd = $(form).serialize();
                    return $.put(url, fd).done((res) => {
                        if (res.error)
                            return Swal.showValidationMessage(res.message);
                        fraPage("kt-table-petition");
                    });
                },
                {
                    width: 600,
                }
            );
        });
    };
    var tripComplete = function (data, button, slug) {
        const btnCompleted = button.querySelector(".btn-trip-complete");
        const url = APP_URL + "activity/verify/" + slug;
        const fd = { _token: CSRF_TOKEN, psts: data.psts };

        if (!btnCompleted) return;
        btnCompleted.addEventListener("click", (b) => {
            b.stopImmediatePropagation();
            b.preventDefault();
            if (validDetail.msg) return swalErr(validDetail.msg);
            // showPageLoading("Tunggu sebentar...");
            $.put(url, fd).done((result) => {
                // hidePageLoading();
                if (result.error)
                    return swalError("Proses tidak berjaya", result);
                $.get(APP_URL + "petition/" + slug).done(function (res2) {
                    if (res2.error) return swalErr(res2.message, res2);
                    let modalBody = $(
                        fraView.querySelector("#kt_modal_body")
                    ).html(res2.html)[0];
                    listDetail(data, modalBody, slug);
                    claim(modalBody, slug);
                });
            });
        });
    };
    var loadValidity = function (code) {
        setTimeout(function (e) {
            if (KTPetition[code] == undefined) return loadValidity(code);
            var field = $.extend(
                {},
                basicValidation,
                KTPetition[code].validity()
            );

            KTPetition[code].init();
            validations = FormValidation.formValidation(form, {
                fields: {},
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: ".fv-row",
                        eleInvalidClass: "",
                        eleValidClass: "",
                    }),
                },
            });
        }, 100);
    };
    var tbodyAttach = function (data, slug) {
        let items = form.querySelector(".dropzone-items");
        let item = items.querySelector(".dropzone-item").cloneNode(true);
        item.removeAttribute("style");

        items.querySelector(".dropzone-clone").innerHTML = data
            .map(function (i, n) {
                let link = item.querySelector("[data-dz-name]");
                item.querySelector(".dropzone-delete").setAttribute(
                    "idx",
                    i.id
                );
                link.textContent = i.filename;
                link.setAttribute("href", APP_URL + "storage/" + i.path);
                return item.outerHTML;
            })
            .join("");

        items.querySelectorAll(".dropzone-delete").forEach(function (e) {
            $(e).on("click", function (k) {
                let idx = $(this).attr("idx");
                $.post(APP_URL + "petition/" + slug + "/delattach", {
                    id: idx,
                    _token: CSRF_TOKEN,
                })
                    .done(function (res, status) {
                        if (res.success) tbodyAttach(res.success, slug);
                    })
                    .fail(function (err) {
                        console.log(err);
                    });
            });
        });
    };
    var formBtnToggle = function (name, flag) {
        let formBtn = document.querySelector(
            '[data-kt-stepper-action="' + name + '"]'
        );
        if (flag) {
            formBtn.disabled = true;
            formBtn.setAttribute("data-kt-indicator", "on");
        } else {
            formBtn.removeAttribute("data-kt-indicator");
            formBtn.disabled = false;
        }
    };
    var listDetail = function (res, divEl, slug) {
        let el = divEl.querySelector("table tbody.kt_table_plist");
        let list = res.plist ?? [];
        let stp = res.stepper;
        let body = res.body;
        if (!el) return;
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
                if ("budget" in l && "verified" in l) {
                    verifyTR = '<td class="text-end">';
                    if (l.verified.code)
                        verifyTR +=
                            '<a href="javascript:;" class="badge badge-light-primary">' +
                                l.verified.code ?? "" + "</a>";
                    else verifyTR += l.verified.code ?? "";
                    verifyTR += "</td>";
                    tr += verifyTR;
                }
                if ("vtype" in l && "verified" in l) {
                    let txt = "";
                    if (l.verified)
                        txt = `<a href="javascript:;" class="badge badge-light-primary">${
                            l.verified ?? ""
                        }</a>`;
                    if (
                        stp.id == 11 &&
                        l.vtype === "car" &&
                        body.closed == undefined
                    ) {
                        // pegawai hendak claim
                        txt = "Serahan kunci";
                        if (l.keyreturn_at) {
                            verifyClss = "primary";
                            verifyTxt = moment(l.keyreturn_at).format(
                                "DD-MM-YYYY"
                            );
                            txt = `<a href="javascript:;" class="badge badge-light-primary" kt-verify-car idx="${n}">${verifyTxt}</a>`;
                        } else {
                            validDetail = {
                                msg: "Sila buat penyerahan kunci dahulu",
                            };
                            txt = `<a href="javascript:;" class="badge badge-light-danger" kt-verify-car idx="${n}">Serahan Kunci</a>`;
                        }
                    } else if (
                        stp.id == 11 &&
                        l.vtype === "car" &&
                        body.closed
                    ) {
                        // pegawai hendak claim
                        verifyTxt = moment(l.keyreturn_at).format("DD-MM-YYYY");
                        txt = `<span class="badge badge-light-secondary text-gray-700 fw-bold fs-6">${verifyTxt}</span>`;
                    }
                    tr += `<td class="text-end">${txt}</td>`;
                }
                tr += "</tr>";
                return tr;
            })
            .join("");

        el.querySelectorAll("[kt-verify-car]").forEach((v) => {
            v.addEventListener("click", function (e) {
                e.preventDefault();
                const index = this.getAttribute("idx");
                const data = list[index];
                let html = `<form id="swaForm"><div class="mb-5">
<label class="form-label mb-2">Tarikh Serahan</label>
<input type="date" name="keyreturn" class="form-control form-control-sm" min="${body.dtback}" value="${body.dtback}">
</div><div class="mb-5">
<label class="form-label mb-2">Odo Sebelum</label>
<input type="number" name="odosebelum" class="form-control form-control-sm">
</div><div class="mb-5">
<label class="form-label mb-2">Odo Selepas</label>
<input type="number" name="odoselepas" class="form-control form-control-sm">
</div><div class="mb-5">
<label class="form-label mb-2">Ulasan</label>
<textarea rows="2" name="remark" class="form-control form-control-sm"></textarea>
</div></form>`;

                swaHtml(
                    "Pemulangan Kunci Kereta " + data.verified,
                    html,
                    function (e) {
                        let frm = document.getElementById("swaForm");
                        let elm = frm.elements;
                        let fd = { _token: CSRF_TOKEN };
                        // let url = APP_URL + 'activity/verify/' + slug;
                        let url = APP_URL + "petition/" + slug + "/plist";

                        list[index].keyreturn_at = elm.keyreturn.value;
                        list[index].odosebelum = elm.odosebelum.value;
                        list[index].odoselepas = elm.odoselepas.value;
                        list[index].remark = elm.remark.value;

                        if (list[index].keyreturn_at == "")
                            return Swal.showValidationMessage(
                                "Tarikh serah diperlukan"
                            );
                        if (list[index].odosebelum == "")
                            return Swal.showValidationMessage(
                                "Odo meter sebelum diperlukan"
                            );
                        if (list[index].odoselepas == "")
                            return Swal.showValidationMessage(
                                "Odo meter selepas diperlukan"
                            );

                        fd.plist = JSON.stringify(list);

                        return $.put(url, fd).done(function (res1) {
                            if (res1.success) return res1;
                            console.error(res1);
                            return Swal.showValidationMessage(res1.message);
                        });
                    },
                    {
                        custbtn: "Kemaskini",
                    }
                ).then((e) => {
                    if (!e.isConfirmed) return;
                    dt.ajax.reload();
                    res.plist = list;
                    listDetail(res, divEl, slug);
                });
            });
        });
    };
    return {
        init: function () {
            fraData = docEl("#kt-table-petition");
            fraView = docEl("#kt-overview-petition");
            form = docEl("#kt_modal_petition_form");
            initDatatable();
            initAction();
        },
        redraw: function () {
            // dt.draw();
            dt.ajax.reload();
        },
    };
})();
KTUtil.onDOMContentLoaded(function () {
    KTPetition.main.init();
});

function getDayDiff(form) {
    let d1 = form.querySelector('.dtback[type="date"]').value;
    let d2 = form.querySelector('.dtout[type="date"]').value;
    let dtout = new Date(d2);
    let dtback = new Date(d1);
    if (isNaN(dtback) || isNaN(dtout)) return;
    diff_days(dtback, dtout);
    form.querySelector(".tday").value = diff_days(dtout, dtback); // + ":" + min.substring(0,2);
    // form.querySelector('.dday').textContent = diffDay + ' hari'
}
