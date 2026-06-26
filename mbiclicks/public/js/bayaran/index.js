"use strict";
const KTBayaran = (() => {
    var tableData;
    var cardTable;
    var cardForm;
    var cardView;
    var bAttach;
    var bForm;
    var bDetails;
    var validations;
    const urlPtActive = APP_URL + "petition/bayaran/getall";
    const urlPtInactive = APP_URL + "petition/bayaran/history";
    const valditaionFields = {
        pdate: {
            validators: {
                notEmpty: { message: "Tarikh permohonan diperlukan" },
            },
        },
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
        plist: {
            validators: {
                callback: {
                    message: "Butiran bayaran diperlukan sekurang-kurangnya 1",
                    callback: function (input) {
                        if (input.value == "" || input.value == "[]")
                            return false;
                        return true;
                    },
                },
            },
        },
    };
    const columnDefs = [
        { targets: 0, orderable: false, className: "text-start" },
        { targets: 1, orderable: false },
        { targets: 2, orderable: false },
        { targets: 3, orderable: false },
        { targets: 4, orderable: false },
        { targets: 5, orderable: false, className: "text-end" },
        {
            targets: -1,
            data: null,
            orderable: false,
            className: "text-end",
        },
    ];
    return {
        init: function () {
            cardTable = $el("#card-table");
            cardForm = $el("#card-form");
            cardView = $el("#card-view");
            bForm = $el("#bayaran-form");
            bDetails = $("#plist");
            bAttach = $el("#attactfile");

            // init Validations
            validations = FormValidation.formValidation(bForm, {
                fields: valditaionFields,
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: ".fv-row",
                        eleInvalidClass: "",
                        eleValidClass: "",
                    }),
                },
            });

            // init select2
            initSelect2(
                APP_URL + "conf/budget/getbudget",
                "#itembudget",
                "body",
                { width: "resolve" }
            );
            initSelect2(APP_URL + "supplier", "#sup_select", "body");

            // init Table
            tableData = kt_DT({
                procces: true,
                server: true,
                el: "#table_bayaran",
                url: urlPtActive,
                columns: [
                    { data: "pdt" },
                    { data: "body.perkara" },
                    { data: "remark" },
                    {
                        data: "stepper",
                        render: (data, type, { psts }) => {
                            let arr = [];
                            if (psts === 3) arr = ["success", "Selesai"];
                            if (psts === 5) arr = ["warning", "Semak Semula"];
                            if (psts === 6) arr = ["danger", "Tidak Lulus"];
                            if (data?.id > 1) arr = ["info", data?.name];
                            if (arr.length === 0) return "";
                            return `<span class="badge badge-light-${arr[0]} fs-7 fw-bold">${arr[1]}</span>`;
                        },
                    },
                    { data: "outstanding" },
                    { data: null, render: renderAction },
                ],
                columnDefs: columnDefs,
                dataSrc: (d) => console.log(),
                handleActionButton: () => handleRender(tableData, bDetails),
            });

            // init Listerner
            $("#btnAddSup").on("click", (e) => addSupplier());
            $("#addDetail").on("click", (e) => addDetial(bDetails, bForm));
            $(".attachment").on("change", (e) => formUpload(bForm));
            $el("#btnAdd").click((e) => initForm(null, bDetails));
            $el("#search").change((e) => tableData.search(e.value).draw());
            $el(".btnBack").forClick((b) => fraPage("card-table"));
            $el("#btnSave").click((e) => saveForm(validations, tableData));
            $el("#btnSubmit").click((e) => submit(tableData));
            $el('[name="activity_status"]').each((e) =>
                statusActive(e, tableData, urlPtActive, urlPtInactive)
            );
        },
        redraw: function () {
            // tableData.draw();
            tableData.ajax.reload();
        },
    };
})();
KTUtil.onDOMContentLoaded(() => KTBayaran.init());
