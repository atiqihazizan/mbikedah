"use strict";
var kt_leave = function(){
    var dt;
    var initDatatable = function(){
        let columns = [
            {data: 'leave'},
            {data: 'unit'},
            {data: 'def'},
            {data: 'def' },
        ], columnDefs = [
            // {searchPanes: {show: true,}, targets: '_all',},
            {targets: 0, orderable: true},
            {targets: 2, orderable: true, className: 'text-end'},
            {targets: -1, orderable: false, className: 'text-end', render: (data, type, row) => {
                let btn = `<a href="#" class="btn btn-icon btn-primary w-25px h-25px" kt-table-action="edit_row">
<span class="fa fa-pencil-alt fs-8"></span></a>`;
                btn += `<a href="#" class="btn btn-icon btn-danger w-25px h-25px ms-3" kt-table-action="del_row">
<span class="fa fa-trash-alt fs-8"></span></a>`
                if(row.yearupto.length === 0) return btn
                return ''
            }}
        ]
        dt = kt_DT({
            len:6,
            menu:[[6,10, 25, 50, -1],[6,10, 25, 50, 'All']],
            server:true,
            url:APP_URL + 'conf/leave/?json=1',
            el:'#table_leave',
            columns:columns,
            columnDefs:columnDefs,
            handleActionButton:handleActionButton,
            dataSrc:function(d){}
        })
    }
    var handleSearchDatatable = function () {
        const filterSearch = document.querySelector('[data-kt-docs-table-filter="search"]');
        const addNew = document.querySelector('[data-kt-docs-table-action="add_new"]');
        filterSearch.addEventListener('keyup', function (e) {
            dt.search(e.target.value).draw();
        });
        addNew.addEventListener('click',function(e){
            let html = formSwal()
            e.preventDefault();
            swaHtml(  'Tambah Baru',html,function(el){
                let form = document.getElementById('swaform')
                let formSerial = $(form).serializeArray()
                let param = {_token:CSRF_TOKEN, ...formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )}
                return $.post(APP_URL+'conf/leave/',param).then(res => {
                    if(!res.success) {
                        Swal.showValidationMessage(res.message);
                        console.log(res)
                    }
                })
            },{custbtn:'Tambah'}).then(res => {
                if(!res.isConfirmed) return;
                dt.ajax.reload();
            })
        })
    }
    var btnDt = function(qs,callback){
        const buttons = document.querySelectorAll(qs);
        buttons.forEach(b => {
            let data = dt.row( b.closest('tr') ).data();
            b.addEventListener('click', function(e){
                e.preventDefault()
                callback(data)
            })
        })
    }
    var handleActionButton = () => {
        let url = APP_URL+'conf/leave/'
        btnDt('[kt-table-action="edit_row"]',function(data){
            let html = formSwal(data)
            swaHtml(  toTitleCase(data.leave),html,function(el){
                let form = document.getElementById('swaform')
                let formSerial = $(form).serializeArray()
                let param = {_token:CSRF_TOKEN, ...formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )}
                return $.put(url + data.id,param).then(res => {
                    if(!res.success) {
                        Swal.showValidationMessage(res.message);
                        console.log(res)
                    }
                })
            },{custbtn:'Kemaskini'}).then(res => {
                if(!res.isConfirmed) return;
                dt.ajax.reload();
            })
        })
        btnDt('[kt-table-action="del_row"]',function(data){
            swaConfirm( 'Buang ' + data.leave,'Pasti hendak buang?','Buang').then(res=>{
                if (!res.isConfirmed) return
                $.delete(url+data.id,{_token:CSRF_TOKEN}).done(res => {
                    if(!res.success) return console.log(res)
                    dt.ajax.reload();
                })
            })
        })
    }
    function formSwal(data={}){
        let select,opt = ['Pilih','Jam','Hari','RM']
        select = opt.map((e,n) => {
            let select = ''
            if(n == data.typ??0) select = 'selected'
            return `<option value=${n} ${select}>${e}</option>`;
        }).join('')
        return `<form id="swaform">
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Nama:</label>
    <input type="text" class="form-control" name="leave" value="${data.leave??''}">
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Unit:</label>
    <select class="form-select" name="typ">${select}</select>
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Kelayakan:</label>
    <input type="number" class="form-control" name="def" value="${data.def??0}">
</div>
</form>`
    }
    return {
        init:function(){
            initDatatable()
            handleSearchDatatable()
        }
    }
}()

document.addEventListener("DOMContentLoaded", () => {
    kt_leave.init();
});
