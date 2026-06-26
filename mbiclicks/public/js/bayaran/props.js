const statusActive = function (a, dt, url1, url2) {
    $(a).change((e) => {
        const { val } = e.target.dataset;
        if (parseInt(val) === 0) {
            dt.ajax.url(url2).load();
        } else {
            dt.ajax.url(url1).load();
        }
    });
};
const renderAction = function (data, type, row) {
    let sts = row.psts;
    if (APP_AUTH !== row.created_id) sts = 0;
    if ([1, 5].includes(sts)) {
        return `<a href="#" class="btn btn-sm btn-icon" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end"><i class="bi bi-three-dots fs-5"></i></a>
    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4" data-kt-menu="true">
        <div class="menu-item px-3"><a href="#" class="menu-link px-3 btnEdit">Edit</a></div>
        <div class="menu-item px-3"><a href="#" class="menu-link px-3 btnDel">Delete</a></div>
    </div>`;
    } else {
        return `<a href="javascript:;" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px btnView">
<span class="svg-icon svg-icon-2"><svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
    <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75
    18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25
    5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z" fill="currentColor"></path>
    </svg>
</span>
</a>`;
    }
};
const saveIndicator = function (flag) {
    let btnSave = $el("#btnSave");
    let btnSubmit = $el("#btnSubmit");
    if (flag) {
        $el("#btnprocces").disabled = true;
        // btnSubmit.disabled = true;
        // btnSave.disabled = true;
        btnSave.setAttribute("data-kt-indicator", "on");
    } else {
        btnSave.removeAttribute("data-kt-indicator");
        // btnSave.disabled = false;
        // btnSubmit.disabled = false;
        $el("#btnprocces").disabled = false;
    }
};
const submitIndicator = function (flag) {
    let btnSave = $el("#btnSave");
    let btnSubmit = $el("#btnSubmit");
    if (flag) {
        $el("#btnprocces").disabled = true;
        // btnSubmit.disabled = true;
        // btnSave.disabled = true;
        btnSubmit.setAttribute("data-kt-indicator", "on");
    } else {
        btnSubmit.removeAttribute("data-kt-indicator");
        // btnSave.disabled = false;
        // btnSubmit.disabled = false;
        $el("#btnprocces").disabled = false;
    }
};
const resetItems = () => {
    $("#itembudget").val("").trigger("change");
    $el("#itemname").value = "";
    $el("#itemref").value = "";
    $el("#itemunit").value = "0";
    $el("#itemamt").value = "0.00";
};
const tbodyItem = (raws) => {
    const bForm = $el("#bayaran-form");
    const plist = raws.val();
    const tbody = $("#tbody_item")[0];
    let total = 0;
    let data = plist ? JSON.parse(plist) : [];

    tbody.innerHTML = "";
    if (data == null) return;

    const rows = data
        .map(function (i, n) {
            total += parseFloat(i.total);
            return `<tr style="height:50px">
                <td class="ps-4">${i.budget.code}</td>
                <td class="ps-4">${i.item}</td>
                <td class="text-center">${i.refe ?? ""}</td>
                <td class="text-center">${i.unit}</td>
                <td class="text-end ">${currency(i.amnt)}</td>
                <td class="text-end ">${currency(i.total)}</td>
                <td class="text-center pe-2">
                    <a class="btn btn-icon btn-sm btn-danger w-25px h-25px del-detail" idx="${n}"><i class="fa fa-times"></i></a>
                </td>
            </tr>`;
        })
        .join("");
    tbody.innerHTML = rows + '<tr><td colspan="7"></td></tr>';
    $el("#grandtotal").innerHTML = currency(total);
    $el("[name='tamt']").value = total;
    $el("#tbody_item >tr > td a.del-detail", true).forEach(function (e) {
        $(e).on("click", function (k) {
            let idx = $(this).attr("idx");
            let plist = raws.val();
            let obj = [];
            k.preventDefault();
            if (plist.length < 3) return;
            obj = JSON.parse(plist);
            obj.splice(idx, 1);
            raws.val(JSON.stringify(obj));
            tbodyItem(raws);
        });
    });
};
const formUpload = function (bForm) {
    const { loading, loadingDone } = pageLoading();
    const slug = bForm.elements.slug.value;
    const file = $el("#attach");
    const ufile = file.files[0];
    const filePath = file.value;
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
        return;
    }
    //convert to megabyte
    let t = (ufile.size / 1024 / 1024).toFixed(1);
    if (t > 2) {
        swalErr("Saiz fail tidak boleh melebihi dari 2MB", null);
        return;
    }
    loading();
    fetch(url, { method: "POST", body: fd })
        .then((res) => res.json())
        .then(function (data) {
            loadingDone();
            if (data.fails)
                swalErr("Muatnaik dokumen tidak berjaya", data.fails);
            if (data.success) tbodyAttach(data.success, slug);
        })
        .catch((e) => {
            console.log(e);
            loadingDone();
        });
};
const tbodyAttach = function (data, slug) {
    const bForm = $el("#bayaran-form");
    const items = bForm.querySelector(".dropzone-items");
    const item = items.querySelector(".dropzone-item").cloneNode(true);
    item.removeAttribute("style");

    items.querySelector(".dropzone-clone").innerHTML = data
        .map(function (i, n) {
            const link = item.querySelector("[data-dz-name]");
            item.querySelector(".dropzone-delete").setAttribute("idx", i.id);
            link.textContent = i.filename;
            link.setAttribute("href", APP_URL + "storage/" + i.path);
            return item.outerHTML;
        })
        .join("");

    items.querySelectorAll(".dropzone-delete").forEach(function (e) {
        $(e).on("click", function (k) {
            let idx = $(this).attr("idx");
            const { loading, loadingDone } = pageLoading();
            loading();
            $.post(APP_URL + "petition/" + slug + "/delattach", {
                id: idx,
                _token: CSRF_TOKEN,
            })
                .done(function (res, status) {
                    loadingDone();
                    if (res.success) tbodyAttach(res.success, slug);
                })
                .fail(function (err) {
                    loadingDone();
                    console.log(err);
                });
        });
    });
};
const handleRender = function (tableData, bDetails) {
    const { loading, loadingDone } = pageLoading();

    $el(".btnEdit", true).forEach((b, n) =>
        $el(b).click((e) => {
            const data = tableData.row(b.closest("tr")).data();
            const url = APP_URL + "petition/bayaran/" + data.slug + "/edit";
            e.stopImmediatePropagation();
            e.preventDefault();
            loading();
            $.get(url, ({ petition }) =>
                initForm(petition, bDetails).then(() => loadingDone())
            );
        })
    );
    $el(".btnDel", true).forEach((b, n) =>
        $el(b).click((e) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            const data = tableData.row(b.closest("tr")).data();
            const url = APP_URL + "petition/bayaran/" + data.slug;
            const c = confirm("Anda pasti hendak buang permohonan ini?");
            if (!c) return;
            $.post(url, { _method: "delete", _token: CSRF_TOKEN })
                .done(function (res, status) {
                    if (res.success) tableData.ajax.reload();
                })
                .fail((err) => console.log(err));
        })
    );
    $el(".btnView", true).forEach((b, index) => {
        $el(b).click((e) => {
            const data = tableData.row(b.closest("tr")).data();
            const slug = data.slug;

            loading();
            e.stopImmediatePropagation();
            e.preventDefault();
            $.get(APP_URL + "petition/bayaran/" + slug)
                .done(function (res) {
                    loadingDone();
                    if (res.error) return swalErr(res.message, res);
                    const {
                        petition: { body, plist, psts, ...ptt },
                        status,
                        attach,
                        log,
                    } = res;

                    const data = JSON.parse(body);
                    const raws = JSON.parse(plist);
                    $el(".overview").each((o) => {
                        const field = o.dataset.field;
                        const format = o.dataset.format;

                        $el("#cur-state").textContent =
                            psts === 3 ? "Selesai" : status;
                        if (ptt[field]) o.textContent = ptt[field];
                        if (data[field]) o.textContent = data[field];
                        if (format === "date")
                            o.textContent = moment(o.textContent).format(
                                "DD-MM-YYYY"
                            );
                        if (field === "sup") {
                            o.textContent = suppliers.find(
                                (f) => f.id === parseInt(data.payto)
                            ).text;
                        }
                        if (format === "curr")
                            o.textContent = currency(o.textContent);
                    });
                    $el("#timeline").innerHTML = log ?? "";
                    const tbody = $el("#detail_bayaran");
                    tbody.innerHTML = raws
                        .map(
                            ({
                                budget: { code },
                                item,
                                refe,
                                unit,
                                amnt,
                                total,
                            }) => `<tr>
                        <td class="text-center ps-4">${code}</td>
                        <td>${item}</td>
                        <td class="text-center">${refe}</td>
                        <td class="text-center">${unit}</td>
                        <td class="text-end">${currency(amnt)}</td>
                        <td class="text-end pe-4">${currency(total)}</td>
                    </tr>`
                        )
                        .join("");
                    const aTbody = $el("#attach_bayaran");
                    aTbody.innerHTML = attach
                        .map(({ filename }) => `<tr><td>${filename}</td></tr>`)
                        .join("");
                    fraPage("card-view");
                })
                .fail(() => {
                    loadingDone();
                });
        });
    });
};
const initForm = async function (res, bDetails) {
    const bForm = $el("#bayaran-form");
    const eForm = bForm.elements;

    bForm.reset();
    eForm.plist.value = "";
    eForm.slug.value = "";
    $("#sup_select").val("").trigger("change");
    $el(".editable", true).each((e) => e.classList.add("d-none"));
    resetItems();
    if (res) {
        const { slug, pdate, body, plist, stepnow } = res;
        const content = JSON.parse(body);
        eForm.slug.value = slug;
        eForm.pdate.value = pdate;
        eForm.plist.value = plist;
        $el(".editable", true).each((e) => e.classList.remove("d-none"));
        if (stepnow !== 1)
            $el(".prosessing", true).each((e) => e.classList.add("d-none"));

        for (const b in content) {
            if (eForm[`body[${b}]`]) eForm[`body[${b}]`].value = content[b];
        }
        $("#sup_select").trigger("change.select2"); // Notify only Select2 of changes
        $.get(
            APP_URL + "petition/" + slug + "/getattach",
            ({ success }, status) => {
                return tbodyAttach(success, slug) ?? [];
            }
        );
    }
    fraPage("card-form");
    tbodyItem(bDetails);
};
const addSupplier = () => {
    swaTextOnly(
        "Masukkan nama individu atau syarikat",
        "",
        "Tambah",
        function (nama) {
            let data = { nama: nama, _token: CSRF_TOKEN };
            if (nama.length == 0)
                return Swal.showValidationMessage("Sila masukkan nama!");
            return $.post("/supplier", data).done(function (res, status) {
                if (!res.data)
                    return Swal.showValidationMessage(`Request failed: ${res}`);
            });
        }
    ).then((res) => {
        if (!res.isConfirmed) return;
        $("#sup_select").select2({ data: res.value.data });
    });
};
const addDetial = (bDetails, bForm) => {
    let obj = [];
    const plist = bDetails.val();
    const item = $el("#itemname").value;
    const itemMD5 = item.replaceAll(" ", "").toLowerCase().trim();
    const budgetEl = $("#itembudget").select2("data") ?? [];
    const budget =
        (({ id, code, name, text }) => ({ id, code, name, text }))(
            budgetEl[0]
        ) ?? {};
    const data = {
        budget: budget,
        refe: $el("#itemref").value,
        unit: $el("#itemunit").value,
        amnt: $el("#itemamt").value,
        item: item,
        slug: MD5(itemMD5 + budget.code),
        allow: [5],
        verified: [],
    };

    try {
        if (budget.id === "") throw "Bajet tidak pilih";
        if (data.item.length === 0) throw "Perkara diperlukan";
        if (isNaN(parseInt(data.unit)) || data.unit == 0)
            throw "Unit diperlukan";
        if (isNaN(parseInt(data.amnt)) || data.amnt == 0)
            throw "Harga diperlukan";
        if (plist.indexOf(data.slug) != -1)
            throw item + " untuk bajet " + budget.code + " sudah ditambah";
        if (plist.length > 0) obj = JSON.parse(plist);
        data.total = parseFloat(data.amnt) * parseFloat(data.unit);

        obj.push(data);
        bDetails.val(JSON.stringify(obj));
        tbodyItem(bDetails);
    } catch (e) {
        swaError(e);
    }
};
const submit = function (dt) {
    const form = $el("#bayaran-form");
    const slug = form.elements.slug.value;
    let url = APP_URL + "petition/bayaran/" + slug + "/submit";
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
            submitIndicator(true);
            $.post(url, dp)
                .done(function (res, status) {
                    submitIndicator(false);
                    try {
                        if (!res.success) throw res;
                        fraPage("card-table");
                        dt.columns.adjust().draw();
                        dt.ajax.reload();
                    } catch (e) {
                        if (e.error)
                            swalErr(Object.values(e.error).join(","), e);
                    }
                })
                .fail(function (err) {
                    submitIndicator(false);
                    swalErr(
                        "Maaf, Permohonan tidak berjaya dihantar",
                        err.responseJSON
                    );
                });
        }
    });
};
const saveForm = async (validations, tableData) => {
    const bForm = $el("#bayaran-form");
    const slug = bForm.elements.slug.value;
    const isEdit = slug.length > 1;
    const editHidden = bForm.querySelectorAll(".editable.d-none");
    let url = APP_URL + "petition/bayaran";
    let dp = $(bForm).serialize();

    if (isEdit) {
        url += "/" + slug;
        dp += "&_method=PUT";
        if (slug.length <= 50)
            return swalErr(
                "Maaf, Permohohan tidak berjaya disimpan",
                "invalid slug : " + slug
            );
    }
    //
    const fv = await validations.validate();
    if (fv !== "Valid") return false;
    saveIndicator(true);
    return $.post(url, dp)
        .done(function (res, status) {
            saveIndicator(false);
            try {
                if (!res.success) throw res;
                bForm.elements.slug.value = res.slug;
                tableData.ajax.reload();
                // fraPage("card-table");
                // tableData.columns.adjust().draw();
                editHidden.forEach((e) => e.classList.remove("d-none"));
                swaSuccess("Permohonan berjaya disimpan");
                return true;
            } catch (e) {
                if (!e.error) return true;
                swalErr(Object.values(e.error).join(","), e);
                return false;
            }
        })
        .fail(function (err) {
            saveIndicator(false);
            swalErr("Rekod tidak berjaya simpan", err.responseJSON);
            return false;
        });
};
