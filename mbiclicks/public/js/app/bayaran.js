KTPetition.bayaran = (function () {
    var form;
    var ePList;

    // Private Functions
    var initForm = function () {
        $(form.querySelector("[kt-app-add-sup]")).on("click", function (e) {
            e.preventDefault();
            swaTextOnly(
                "Masukkan nama individu atau syarikat",
                "",
                "Tambah",
                function (nama) {
                    let data = { nama: nama, _token: CSRF_TOKEN };
                    if (nama.length == 0)
                        return Swal.showValidationMessage(
                            "Sila masukkan nama!"
                        );
                    return $.post("/supplier", data).done(function (
                        res,
                        status
                    ) {
                        if (!res.data)
                            return Swal.showValidationMessage(
                                `Request failed: ${res}`
                            );
                    });
                }
            ).then((res) => {
                if (!res.isConfirmed) return;
                $("#sup_select").select2({ data: res.value.data });
            });
        });
        $(form.querySelector(".add-detail")).on("click", function (e) {
            e.preventDefault();
            let plist = ePList.val();
            let obj = [];
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
                    throw (
                        item + " untuk bajet " + budget.code + " sudah ditambah"
                    );
                if (plist.length > 0) obj = JSON.parse(plist);
                data.total = parseFloat(data.amnt) * parseFloat(data.unit);
                obj.push(data);
                ePList.val(JSON.stringify(obj));
                tbodyItem();
            } catch (e) {
                swaError(e);
                // toastr.error(e)
            }
        });
    };
    function tbodyItem() {
        let plist = ePList.val();
        let tbody = $(form.querySelector("#tbody_item"))[0];
        let total = 0;
        let data = plist ? JSON.parse(plist) : [];

        tbody.innerHTML = "";
        if (data == null) return;

        tbody.innerHTML = data
            .map(function (i, n) {
                total += parseFloat(i.total);
                return `<tr>
    <td class="ps-4">${i.budget.code}</td>
    <td class="ps-4">${i.item}</td>
    <td class="text-center">${i.refe ?? ""}</td>
    <td class="text-center">${i.unit}</td>
    <td class="text-end ">${currency(i.amnt)}</td>
    <td class="text-end ">${currency(i.total)}</td>
    <td class="text-center pe-2"><a class="btn btn-icon btn-sm btn-danger w-25px h-25px del-detail" idx="${n}"><i class="fa fa-times"></i></a></td>
</tr>`;
            })
            .join("");
        document.getElementById("grandtotal").innerHTML = currency(total);
        form.elements.tamt.value = total;

        document
            .querySelectorAll("#tbody_item >tr > td a.del-detail")
            .forEach(function (e) {
                $(e).on("click", function (k) {
                    let idx = $(this).attr("idx");
                    let plist = ePList.val();
                    let obj = [];
                    k.preventDefault();
                    if (plist.length < 3) return;
                    obj = JSON.parse(plist);
                    obj.splice(idx, 1);
                    ePList.val(JSON.stringify(obj));
                    tbodyItem();
                });
            });
    }
    function selectInit() {
        initSelect2(APP_URL + "conf/budget/getbudget", "#itembudget", "body", {
            width: "resolve",
        });
        initSelect2(APP_URL + "supplier", "#sup_select", "body");
    }
    return {
        // Public Functions
        init: function () {
            form = document.querySelector("#kt_modal_petition_form");
            selectInit();
            initForm();
            ePList = $(form.querySelector('[name="plist"]'));
            tbodyItem();
        },
        validity: function () {
            return {
                // "body[urusniaga]": {
                //     validators: {
                //         notEmpty: { message: "Jenis urusniaga diperlukan" },
                //     },
                // },
                // "body[budget]": {
                //     validators: {
                //         notEmpty: { message: "Kod Bajet diperlukan" },
                //     },
                // },
                "body[payto]": {
                    validators: {
                        notEmpty: { message: "Individu/Syarikat diperlukan" },
                    },
                },
                "body[perkara]": {
                    validators: {
                        notEmpty: { message: "Keterangan bayaran diperlukan" },
                    },
                },
                // "body[paydate]": {
                //     validators: { notEmpty: { message: "Tarikh diperlukan" } },
                // },
                // 'plist': {validators: {notEmpty: {message: 'Perincian bayaran diperlukan'}}}
                plist: {
                    validators: {
                        notEmpty: {
                            message: "Butiran untuk bayaran tidak lengkap",
                        },
                        callback: {
                            message: "Butiran untuk bayaran tidak lengkap",
                            callback: function (input) {
                                if (input.value == "" || input.value == "[]")
                                    return false;
                                return true;
                            },
                        },
                    },
                },
            };
        },
    };
})();

// KTPetition.bayaran.init();
