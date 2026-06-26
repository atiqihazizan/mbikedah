const CSRF_TOKEN = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
const PAY_TYPE_CHEQUE = 1;
const PAY_TYPE_ONLINE = 2;

const docEl = (el, all = false) => {
    const e = !el.nodeType ? document.querySelectorAll(el) : el;
    if (e.length === 0) return [];
    if (e.length === 1 && all === false) return e[0];
    return e;
};
const eHandle = (e) => (!e.nodeType ? docEl(e) : e);
const eClick = (e, cb) => eHandle(e).addEventListener("click", cb);
const eKeyUp = (e, cb) => eHandle(e).addEventListener("keyup", cb);

const $el = (el, all = false) => {
    let o = el;
    if (!o.nodeType) {
        const text = el.split("#");
        o =
            text[0] === "#"
                ? document.getElementById(el)
                : document.querySelectorAll(el);
    }
    if ((!o.nodeType && o.length > 1) || all) {
        const elm = o;
        elm.forClick = (cb) =>
            elm.forEach((b) => {
                b.addEventListener("click", (e, index) => {
                    e.preventDefault();
                    cb(e, index);
                });
            });
        elm.each = (cb) => elm.forEach((el) => cb(el));

        return elm;
    }
    const node = o.nodeType ? o : o[0];
    const elm = node;
    if (elm == undefined) {
        return {
            click: () => {},
        };
    }
    elm.click = (cb) =>
        node.addEventListener("click", (e) => {
            e.preventDefault();
            cb(e);
        });
    elm.keyup = (cb) =>
        node.addEventListener("keyup", (e) => {
            e.preventDefault();
            cb(e);
        });
    elm.change = (cb) => node.addEventListener("change", (e) => cb(e.target));
    elm.delClass = (cn) =>
        node.classList.contains(cn) ? node.classList.remove(cn) : null;
    elm.addClass = (cn) =>
        !node.classList.contains(cn) ? node.classList.add(cn) : null;
    return elm;
};

toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toastr-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "3000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
};
window.setTimeout(function () {
    $(".alert")
        .fadeTo(500, 0)
        .slideUp(500, function () {
            $(this).remove();
        });
}, 5000);
function getTimeNow() {
    const d = new Date();
    let time = d.getTime();
    return time;
}
function formValidatorInit(form, field) {
    return FormValidation.formValidation(form, {
        fields: field,
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                eleInvalidClass: "",
                eleValidClass: "",
            }),
        },
    });
}
function swalErr(txt, err) {
    Swal.fire({
        html: txt,
        icon: "error",
        buttonsStyling: false,
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-light" },
    });
    if (err) {
        console.error(err);
    }
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
// function inputNumeric(input,def=''){input.value = input.value.replace(/[^0-9.]/g, def).replace(/(\..*)\./g, '$1');}
function inputWordsKeydown(event) {
    return /[a-z_ ]/i.test(event.key);
}
function inputNumberWordwithoutspce(event) {
    return /[a-z0-9_]/i.test(event.key);
}
function inputNumeric(input, def = "") {
    input.value = input.value.replace(/[^0-9]/g, def);
    //input.value = input.value.replace(/[^0-9.]/g, def).replace(/(\..*)\./g, '$1');
    //this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    //this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^0[^.]/, '0');
    //That will allow 0.123 or .123 but not 0123 or 00.123.
}
function inputCurrency(input, def = "") {
    input.value = input.value
        .replace(/[^0-9.]/g, def)
        .replace(/(\..*)\./g, "$1");
}
function currency(str, def) {
    // let curr = (str * 1)>0? (str * 1).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '';
    if (typeof str === "string") {
        const curr1 = str.split(",");
        if (curr1.length > 1) return str;
    }
    let curr = parseFloat(str * 1)
        ? Number.parseFloat(str)
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, "$&,")
        : "";
    if (def && curr === "") curr = def;
    return curr;
}
function dataTypeFormat(obj, val) {
    switch (obj.attr("dtyp")) {
        case "d":
            return obj.html(moment(val).format("DD MMM YYYY"));
            break;
        case "c":
            return obj.html(currency(val));
            break;
        case "h":
            return obj.html(moment(val, "HH:mm").format("hh:mm A"));
        default:
            return obj.html(val);
    }
}
function printClick(id, title) {
    let div = document.getElementById(id);
    printJS(div.innerHTML, title);
}
function printJS(html, title) {
    let ifra = document.getElementById("printJS");
    let tmpTitle = document.title;
    document.title = title;

    if (ifra === null) {
        ifra = document.createElement("iframe");
        ifra.id = "printJS";
        ifra.setAttribute(
            "style",
            "position: absolute;width: 0;height: 0;border: 0; visibility: hidden;"
        );
        window.document.body.appendChild(ifra);
    }
    ifra =
        ifra.contentWindow ||
        ifra.contentDocument.document ||
        ifra.contentDocument;
    ifra.document.title = title;
    ifra.document.write(
        `<!DOCTYPE html><html lang="en"><head><title>${title}</title>`
    );
    ifra.document.write(
        `<link href="${APP_URL}./assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />`
    );
    ifra.document.write(
        `<link href="${APP_URL}./assets/css/style.bundle.css" rel="stylesheet" type="text/css" />`
    );
    ifra.document.write(
        '</head><body class="app-default" onload="window.print();window.close()" style="background: #FFFFFF; padding: 5mm;">'
    );
    ifra.document.write(html);
    ifra.document.write("</body></html>");

    ifra.document.close(); // necessary for IE >= 10
    ifra.focus(); // necessary for IE >= 10*/
    // document.title = tmpTitle;
    return true;
}
function exportTableToExcel(tableId, filename = "") {
    let downloadLink;
    let dataType = "application/vnd.ms-excel";
    let tableSelect = document.getElementById(tableId);
    let tableHtml = tableSelect.outerHTML.replace(/ /g, "%20");

    // Specify file name
    filename = filename ? filename + ".xls" : "excel_data.xls";

    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBload) {
        let blob = new Blob(["\ufeff", tableHtml], {
            type: dataType,
        });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = "data:" + dataType + "," + tableHtml;
        downloadLink.download = filename;
        downloadLink.click();
    }
}
function toExcel(elTable, filename = "") {
    if ("ActiveXObject" in window) {
        alert("This is Internet Explorer!");
    } else {
        var cache = {};
        this.tmpl = function tmpl(str, data) {
            var fn = !/\W/.test(str)
                ? (cache[str] =
                      cache[str] ||
                      tmpl(document.getElementById(str).innerHTML))
                : new Function(
                      "obj",
                      "var p=[],print=function(){p.push.apply(p,arguments);};" +
                          "with(obj){p.push('" +
                          str
                              .replace(/[\r\t\n]/g, " ")
                              .split("{{")
                              .join("\t")
                              .replace(/((^|}})[^\t]*)'/g, "$1\r")
                              .replace(/\t=(.*?)}}/g, "',$1,'")
                              .split("\t")
                              .join("');")
                              .split("}}")
                              .join("p.push('")
                              .split("\r")
                              .join("\\'") +
                          "');}return p.join('');"
                  );
            return data ? fn(data) : fn;
        };
        var tableToExcel = (function () {
            var uri = "data:application/vnd.ms-excel;base64,",
                template =
                    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{{=worksheet}}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{{for(var i=0; i<tables.length;i++){ }}<table>{{=tables[i]}}</table>{{ } }}</body></html>',
                base64 = function (s) {
                    return window.btoa(unescape(encodeURIComponent(s)));
                },
                format = function (s, c) {
                    return s.replace(/{(\w+)}/g, function (m, p) {
                        return c[p];
                    });
                };
            return function (tableList, name) {
                if (!tableList.length > 0 && !tableList[0].nodeType)
                    table = document.getElementById(table);
                var tables = [];
                for (var i = 0; i < tableList.length; i++) {
                    tables.push(tableList[i].innerHTML);
                }
                var ctx = {
                    worksheet: name || "Worksheet",
                    tables: tables,
                };
                const link = uri + base64(tmpl(template, ctx));
                let downloadLink = document.getElementById("exportexls");
                // window.location.href = link
                if (
                    typeof downloadLink == "undefined" ||
                    downloadLink == null
                ) {
                    downloadLink = document.createElement("a");
                    downloadLink.id = "exportxls";
                    document.body.appendChild(downloadLink);
                }
                filename = filename ? filename + ".xls" : "excel_data.xls";
                downloadLink.href = link;
                downloadLink.download = filename;
                downloadLink.click();
            };
        })();
        tableToExcel(elTable, "one");
    }
}
function diff_hours(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60;
    // return Math.abs(Math.round(diff));
    return Math.round(diff); // perlu kepada - atau + utk check

    // var diff = Math.abs(dt1.getTime() - dt2.getTime()) / 3600000;
    // return parseInt(diff);
}
function diff_days(d1, d2) {
    let diffTime = d2 - d1;
    let diffDay = diffTime / (1000 * 3600 * 24);
    if (diffDay >= 0) diffDay += 1;
    return diffDay;
}
function pageLoading(parentId = null) {
    // Populate the page loading element dynamically.
    // Optionally you can skipt this part and place the HTML
    // code in the body element by refer to the above HTML code tab.
    const loadingEl = document.createElement("div");
    // document.body.prepend(loadingEl);
    // let idEl = "kt_app_root";
    const idEl = parentId != null ? parentId : "kt_app_contents";
    const parent = document.getElementById(idEl);
    parent.style = "position:relative";
    function isLoading() {
        parent.prepend(loadingEl);
        loadingEl.classList.add("page-loader");
        loadingEl.classList.add("flex-column");
        loadingEl.classList.add("bg-dark");
        loadingEl.classList.add("bg-opacity-5");
        // loadingEl.style = "top:12%";
        loadingEl.style = "position:absolute";
        loadingEl.innerHTML = `
            <span class="spinner-border text-primary" role="status"></span>
            <span class="text-gray-800 fs-6 fw-semibold mt-5">Loading...</span>
        `;

        // Show page loading
        KTApp.showPageLoading();
    }

    // Hide after 3 seconds
    // setTimeout(function () {
    //     KTApp.hidePageLoading();
    //     loadingEl.remove();
    // }, 3000);

    return {
        show: isLoading,
        hide: () => {
            KTApp.hidePageLoading();
            loadingEl.remove();
        },
        loading: isLoading,
        loadingDone: () => {
            KTApp.hidePageLoading();
            loadingEl.remove();
        },
    };
}
function swaError(text) {
    return Swal.fire({
        text: text,
        icon: "error",
        buttonsStyling: false,
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-danger" },
    });
    // Swal.fire({text: txt, icon: "error", buttonsStyling: false, confirmButtonText: "OK", customClass: {confirmButton: "btn btn-light"}})
}
function swaWarning(text, custbtn) {
    let customConfirm = "OK";
    if (custbtn) customConfirm = custbtn;
    return Swal.fire({
        text: text,
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: customConfirm,
        cancelButtonText: "Batal",
        customClass: {
            confirmButton: "btn btn-warning",
            cancelButton: "btn btn-active-light",
        },
    });
}
function swaInfo(html, custbtn) {
    let customConfirm = "OK";
    if (custbtn) customConfirm = custbtn;
    return Swal.fire({
        html: '<div class="text-start">' + html + "</div>",
        icon: "info",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: customConfirm,
        cancelButtonText: "Batal",
        customClass: {
            confirmButton: "btn btn-info",
            cancelButton: "btn btn-active-light",
        },
    });
}
function swaHtml(title, html, callback, custom = {}) {
    let prop = {
        title: title,
        html: '<div class="text-start">' + html + "</div>",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: "OK",
        cancelButtonText: "Batal",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-active-light",
        },
        showLoaderOnConfirm: true,
        preConfirm: callback,
        allowOutsideClick: true, //() => !Swal.isLoading()
    };
    if (custom.clasbtn)
        prop.customClass.confirmButton = "btn " + custom.clasbtn;
    if (custom.custbtn) prop.confirmButtonText = custom.custbtn;
    if (custom.icon) prop.icon = custom.icon;
    if (custom.onBeforeOpen) prop.onBeforeOpen = custom.onBeforeOpen;
    if (custom.didOpen) prop.didOpen = custom.didOpen;
    if (custom.width) prop.width = custom.width;
    return Swal.fire(prop);
}
function swaSuccess(text) {
    return Swal.fire({
        text: text,
        icon: "success",
        buttonsStyling: false,
        confirmButtonText: "OK",
        customClass: { confirmButton: "btn btn-primary" },
    });
}
function swaQuestion(html, custbtn) {
    let customConfirm = "OK";
    if (custbtn) customConfirm = custbtn;
    return Swal.fire({
        html: '<div class="text-start">' + html + "</div>",
        icon: "question",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: customConfirm,
        cancelButtonText: "Batal",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-active-light",
        },
    });
}
function swaTextOnly(
    title,
    subtitle,
    custbtn,
    callback,
    input = "text",
    def = ""
) {
    let customConfirm = "OK";
    if (custbtn) customConfirm = custbtn;
    let prop = {
        title: title,
        text: subtitle,
        input: input,
        inputValue: def,
        inputAttributes: { autocapitalize: "off", defaultValue: 323 },
        showCancelButton: true,
        confirmButtonText: customConfirm,
        showLoaderOnConfirm: true,
        preConfirm: callback,
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-secondary",
        },
        allowOutsideClick: () => !Swal.isLoading(),
    };
    return Swal.fire(prop);
}
function swaTextarea(opt) {
    return Swal.fire({
        input: "textarea",
        inputLabel: opt.title,
        inputPlaceholder: opt.placeholder,
        inputAttributes: {
            "aria-label": opt.placeholder,
        },
        showCancelButton: true,
        preConfirm: opt.callback,
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-secondary",
        },
    });
}
function swaConfirm(title, text, confirmtext, canceltext) {
    let customConfirm = "Ya";
    let customCancel = "Tidak";

    if (confirmtext) customConfirm = confirmtext;
    if (canceltext) customCancel = canceltext;
    return Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: customConfirm,
        cancelButtonText: customCancel,
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-secondary",
        },
    });
    // .then((result) => {
    //     if (result.isConfirmed) {
    //         Swal.fire(
    //             'Deleted!',
    //             'Your file has been deleted.',
    //             'success'
    //         )
    //     }
    // })
}
function swaLoading(title, html, callback, opt = {}) {
    let prop = {
        title: title,
        html: html,
        // timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            callback();
            // const b = Swal.getHtmlContainer().querySelector('b')
            // timerInterval = setInterval(() => {
            //     b.textContent = Swal.getTimerLeft()
            // }, 100)
        },
        // willClose: () => {
        //     clearInterval(timerInterval)
        // },
    };
    if (opt.willClose) prop.willClose = opt.willClose;

    return swal.fire(prop);
    //  .then((result) => {
    //     /* Read more about handling dismissals below */
    //     if (result.dismiss === Swal.DismissReason.timer) {
    //         console.log('I was closed by the timer')
    //     }
    // })
}
function kt_DT(opt = {}) {
    let dt;
    let table;
    let opts = {
        // fixedHeader: {header:false},
        searchDelay: 100,
        processing: opt.procces ?? false,
        serverSide: opt.server ?? false,
        //'searching': false, // Remove default Search Control
        lengthMenu: opt.menu ?? [
            [7, 10, 25, 50, -1],
            [7, 10, 25, 50, "All"],
        ],
        pageLength: 7, //opt.len ?? 7,
        // scrollY: "500px",
        // scrollX: false,
        // scrollCollapse: true,
        ajax: {
            url: opt.url ?? "",
            // show data after fetch
            dataSrc: function (d) {
                if (opt.dataSrc) opt.dataSrc(d);
                return d.data;
            },
        },
        columns: opt.columns ?? [],
        columnDefs: opt.columnDefs ?? [],
        autoWidth: false,
    };

    if (opt.fixedColumns) opts.fixedColumns = opt.fixedColumns;
    if (opt.createdRow) opts.createdRow = opt.createdRow;
    if (opt.order) opts.order = opt.order;

    dt = $(opt.el ?? "").DataTable(opts);
    table = dt.$;

    dt.on("draw", function () {
        KTMenu.createInstances();
        if (opt.handleActionButton) opt.handleActionButton();
    });
    return dt;
}
function customSelect2(el, parentEl, url, opt = {}) {
    if (!$(el)) return false;
    return $(el).select2({
        // width:'resolve',
        dropdownAutoWidth: false,
        dropdownParent: $(parentEl),
        ajax: {
            url: url,
            type: "get",
            dataType: "json",
            delay: 250,
            data: function (params) {
                return {
                    searchTerm: params.term,
                    // q:params.term,
                    // page:params.page || 1,
                    // pageSize:9
                };
            },
            processResults: (res) => {
                return {
                    results: res.data,
                };
            },
            cache: true,
        },
        // data: [{id: 11, text: 'Pengarah Perhutanan Negeri Kedah'}],
        // templateResult: fnRenderResult,
        // templateSelection: fnRenderSelection,
        selectOnClose: true,
        // width: 'style',
        // width: 'resolve',
        ...opt,
    });
    // $(el).on('select2:select', e => {});
}
async function initSelect2(url, el, parentEl, opt = {}) {
    return $.get(url, function (res, status) {
        const node = document.querySelector(el);
        const def = node?.dataset?.def || 0;

        $(el)
            .select2({
                dropdownParent: $(parentEl),
                data: res.data,
                ...opt,
            })
            .select2("val", def);
        // .val(id)
        // .trigger("change");
    });
}
function fraPage(idEl) {
    let fra = $el(".frapage", true);
    fra.forEach((f) => {
        if (!f.classList.contains("d-none")) f.classList.add("d-none");
    });
    return $el("#" + idEl).classList.remove("d-none");
}
function MD5(e) {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d
            ? g ^ 2147483648 ^ e ^ f
            : c | d
            ? g & 1073741824
                ? g ^ 3221225472 ^ e ^ f
                : g ^ 1073741824 ^ e ^ f
            : g ^ e ^ f;
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h((b & c) | (~b & d), e), g));
        return h((a << f) | (a >>> (32 - f)), b);
    }
    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h((b & d) | (c & ~d), e), g));
        return h((a << f) | (a >>> (32 - f)), b);
    }
    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h((a << f) | (a >>> (32 - f)), b);
    }
    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h((a << f) | (a >>> (32 - f)), b);
    }
    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++)
            (d = (a >>> (8 * c)) & 255),
                (d = "0" + d.toString(16)),
                (b += d.substr(d.length - 2, 2));
        return b;
    }
    var f = [],
        q,
        r,
        s,
        t,
        a,
        b,
        c,
        d;
    e = (function (a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c
                ? (b += String.fromCharCode(c))
                : (127 < c && 2048 > c
                      ? (b += String.fromCharCode((c >> 6) | 192))
                      : ((b += String.fromCharCode((c >> 12) | 224)),
                        (b += String.fromCharCode(((c >> 6) & 63) | 128))),
                  (b += String.fromCharCode((c & 63) | 128)));
        }
        return b;
    })(e);
    f = (function (b) {
        var a,
            c = b.length;
        a = c + 8;
        for (
            var d = 16 * ((a - (a % 64)) / 64 + 1),
                e = Array(d - 1),
                f = 0,
                g = 0;
            g < c;

        )
            (a = (g - (g % 4)) / 4),
                (f = (g % 4) * 8),
                (e[a] |= b.charCodeAt(g) << f),
                g++;
        a = (g - (g % 4)) / 4;
        e[a] |= 128 << ((g % 4) * 8);
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e;
    })(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16)
        (q = a),
            (r = b),
            (s = c),
            (t = d),
            (a = k(a, b, c, d, f[e + 0], 7, 3614090360)),
            (d = k(d, a, b, c, f[e + 1], 12, 3905402710)),
            (c = k(c, d, a, b, f[e + 2], 17, 606105819)),
            (b = k(b, c, d, a, f[e + 3], 22, 3250441966)),
            (a = k(a, b, c, d, f[e + 4], 7, 4118548399)),
            (d = k(d, a, b, c, f[e + 5], 12, 1200080426)),
            (c = k(c, d, a, b, f[e + 6], 17, 2821735955)),
            (b = k(b, c, d, a, f[e + 7], 22, 4249261313)),
            (a = k(a, b, c, d, f[e + 8], 7, 1770035416)),
            (d = k(d, a, b, c, f[e + 9], 12, 2336552879)),
            (c = k(c, d, a, b, f[e + 10], 17, 4294925233)),
            (b = k(b, c, d, a, f[e + 11], 22, 2304563134)),
            (a = k(a, b, c, d, f[e + 12], 7, 1804603682)),
            (d = k(d, a, b, c, f[e + 13], 12, 4254626195)),
            (c = k(c, d, a, b, f[e + 14], 17, 2792965006)),
            (b = k(b, c, d, a, f[e + 15], 22, 1236535329)),
            (a = l(a, b, c, d, f[e + 1], 5, 4129170786)),
            (d = l(d, a, b, c, f[e + 6], 9, 3225465664)),
            (c = l(c, d, a, b, f[e + 11], 14, 643717713)),
            (b = l(b, c, d, a, f[e + 0], 20, 3921069994)),
            (a = l(a, b, c, d, f[e + 5], 5, 3593408605)),
            (d = l(d, a, b, c, f[e + 10], 9, 38016083)),
            (c = l(c, d, a, b, f[e + 15], 14, 3634488961)),
            (b = l(b, c, d, a, f[e + 4], 20, 3889429448)),
            (a = l(a, b, c, d, f[e + 9], 5, 568446438)),
            (d = l(d, a, b, c, f[e + 14], 9, 3275163606)),
            (c = l(c, d, a, b, f[e + 3], 14, 4107603335)),
            (b = l(b, c, d, a, f[e + 8], 20, 1163531501)),
            (a = l(a, b, c, d, f[e + 13], 5, 2850285829)),
            (d = l(d, a, b, c, f[e + 2], 9, 4243563512)),
            (c = l(c, d, a, b, f[e + 7], 14, 1735328473)),
            (b = l(b, c, d, a, f[e + 12], 20, 2368359562)),
            (a = m(a, b, c, d, f[e + 5], 4, 4294588738)),
            (d = m(d, a, b, c, f[e + 8], 11, 2272392833)),
            (c = m(c, d, a, b, f[e + 11], 16, 1839030562)),
            (b = m(b, c, d, a, f[e + 14], 23, 4259657740)),
            (a = m(a, b, c, d, f[e + 1], 4, 2763975236)),
            (d = m(d, a, b, c, f[e + 4], 11, 1272893353)),
            (c = m(c, d, a, b, f[e + 7], 16, 4139469664)),
            (b = m(b, c, d, a, f[e + 10], 23, 3200236656)),
            (a = m(a, b, c, d, f[e + 13], 4, 681279174)),
            (d = m(d, a, b, c, f[e + 0], 11, 3936430074)),
            (c = m(c, d, a, b, f[e + 3], 16, 3572445317)),
            (b = m(b, c, d, a, f[e + 6], 23, 76029189)),
            (a = m(a, b, c, d, f[e + 9], 4, 3654602809)),
            (d = m(d, a, b, c, f[e + 12], 11, 3873151461)),
            (c = m(c, d, a, b, f[e + 15], 16, 530742520)),
            (b = m(b, c, d, a, f[e + 2], 23, 3299628645)),
            (a = n(a, b, c, d, f[e + 0], 6, 4096336452)),
            (d = n(d, a, b, c, f[e + 7], 10, 1126891415)),
            (c = n(c, d, a, b, f[e + 14], 15, 2878612391)),
            (b = n(b, c, d, a, f[e + 5], 21, 4237533241)),
            (a = n(a, b, c, d, f[e + 12], 6, 1700485571)),
            (d = n(d, a, b, c, f[e + 3], 10, 2399980690)),
            (c = n(c, d, a, b, f[e + 10], 15, 4293915773)),
            (b = n(b, c, d, a, f[e + 1], 21, 2240044497)),
            (a = n(a, b, c, d, f[e + 8], 6, 1873313359)),
            (d = n(d, a, b, c, f[e + 15], 10, 4264355552)),
            (c = n(c, d, a, b, f[e + 6], 15, 2734768916)),
            (b = n(b, c, d, a, f[e + 13], 21, 1309151649)),
            (a = n(a, b, c, d, f[e + 4], 6, 4149444226)),
            (d = n(d, a, b, c, f[e + 11], 10, 3174756917)),
            (c = n(c, d, a, b, f[e + 2], 15, 718787259)),
            (b = n(b, c, d, a, f[e + 9], 21, 3951481745)),
            (a = h(a, q)),
            (b = h(b, r)),
            (c = h(c, s)),
            (d = h(d, t));
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase();
}
function text_truncate(str, length, ending) {
    if (length == null) {
        length = 100;
    }
    if (ending == null) {
        ending = "...";
    }
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
    } else {
        return str;
    }
}
jQuery.each(["put", "delete"], function (i, method) {
    jQuery[method] = function (url, data, callback, type) {
        if (jQuery.isFunction(data)) {
            type = type || callback;
            callback = data;
            data = undefined;
        }
        return jQuery.ajax({
            url: url,
            type: method,
            dataType: type,
            data: data,
            success: callback,
        });
    };
});
