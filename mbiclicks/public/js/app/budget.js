"use strict";
var kt_budget = (function () {
    var dt;
    var yrs;
    var filterType;
    var selectEL;
    var captionEL = "";
    var initDatatable = function () {
        let columns = [
                {
                    data: "name",
                    render: (data, type, row) => {
                        let name = toTitleCase(data);
                        let str = name;
                        let code = `<span class="fw-bold text-gray-800 text-hover-primary">${row.code}</span><br>`;
                        return code + str;
                    },
                },
                // { data: null },
            ],
            columnDefs = [
                // {searchPanes: {show: true,}, targets: '_all',},
                { targets: 0, orderable: true, className: "text-start" },
            ];
        for (let i = 1; i < 13; i++) {
            columnDefs.push({
                targets: i,
                orderable: false,
                className: "text-end",
            });
            columns.push({
                data: "b" + i,
                render: (data, type, row) => {
                    let prc = currency(data, "0.00");
                    if (row.btyp == 0)
                        return `<span class="fw-bold text-gray-800 text-hover-danger" style="cursor:not-allowed;">${prc}</span>`;
                    return `<a href="javascript:;" kt_set_budget class="text-gray-600 text-hover-primary" idx="${row.id}" idm="${i}">${prc}</a>`;
                },
            });
        }
        dt = kt_DT({
            el: "#kt_table_budget",
            menu: [
                [5, 10, 25, 50, -1],
                [5, 10, 25, 50, "All"],
            ],
            procces: true,
            server: true,
            url: APP_URL + "conf/budget/?json=" + yrs,
            columns: columns,
            columnDefs: columnDefs,
            // fixedColumns:{left: 1},
            handleActionButton: handleActionButton,
            dataSrc: function (d) {
                $el("[kt-acc-year]").delClass("d-none");
                // document
                //     .querySelector("[kt-acc-year]")
                //     .classList.remove("d-none");
                captionEL.innerText = yrs == 0 ? "" : yrs;
                selectEL.disabled = false;
            },
        });
    };
    var handleActionButton = () => {
        $el("[kt_set_budget]").forEach((b) => {
            $el(b).click(function (e) {
                e.preventDefault();
                let idx = b.getAttribute("idx");
                let raw = dt.row(e.target.closest("tr")).data(); //await $.get(`${APP_URL}conf/budget/${idx}/edit`)
                let html;
                let n = parseInt(b.getAttribute("idm"));

                html = `<form id="swaform"><input type="number" class="form-control text-end" name="budget" value="${
                    raw["b" + n]
                }"></form>`;

                swaHtml(
                    raw.code + " - " + toTitleCase(raw.name),
                    html,
                    function (el) {
                        let form = $el("#swaform");
                        let formSerial = $(form).serializeArray();
                        /* let datVal = formSerial.reduce(
                            (k, v) => ({ ...k, [v.name]: v.value }),
                            {}
                        ); */
                        const val = parseFloat(form.budget.value);
                        // if (val === 0) return true;
                        const data = {};
                        for (var i = n; i < 13; i++) {
                            if (parseFloat(raw["b" + i]) === 0 || i === n) {
                                data["b" + i] = val;
                            } else {
                                data["b" + i] = raw["b" + i];
                            }
                        }
                        let param = {
                            _method: "put",
                            _token: CSRF_TOKEN,
                            yr: yrs,
                            id: idx,
                            data: data,
                        };
                        return $.post(
                            APP_URL + "conf/budget/setbudget",
                            param
                        ).then((res) => {
                            if (res.success) return res;
                            return Swal.showValidationMessage(res.error);
                        });
                    },
                    { custbtn: "Kemaskini" }
                ).then((res) => {
                    if (!res.isConfirmed) return;
                    dt.ajax.reload();
                });
            });
        });
    };
    return {
        init: function () {
            selectEL = $el("[kt_year_budget]");
            yrs = selectEL.value;
            captionEL = $el("[kt-yr-title]");
            captionEL.innerText = yrs == 0 ? "" : yrs;
            selectEL.change(function (e) {
                e.preventDefault();
                this.disabled = true;
                yrs = this.value;
                dt.ajax.url(APP_URL + "conf/budget/?json=" + yrs).load();
            });
            initDatatable();
            $el('[data-kt-docs-table-filter="search"]').keyup((e) =>
                dt.search(e.target.value).draw()
            );
            $el("[kt-acc-year]").click(function (e) {
                let me = e.target;
                e.preventDefault();
                me.setAttribute("data-kt-indicator", "on");
                me.disabled = true;
                $.post(APP_URL + "conf/budget/generate", {
                    _token: CSRF_TOKEN,
                }).then((res) => {
                    me.removeAttribute("data-kt-indicator");
                    if (!res.success) {
                        console.log(res);
                        me.disabled = false;
                        return;
                    }
                    if (res.years) {
                        selectEL.innerHTML = res.years
                            .map((y, n) => {
                                let select = "";
                                if (res.buildyear == y.value)
                                    select = "selected";
                                return `<option value="${y.value}" ${select}>${y.text}</option>`;
                            })
                            .join("");
                        swaSuccess(
                            "Akaun untuk tahun " +
                                res.buildyear +
                                " berjaya dibina"
                        );
                    }
                });
            });
        },
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    kt_budget.init();
});
