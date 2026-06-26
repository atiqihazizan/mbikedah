"use strict";
var kt_banks = function(){
    var financeBudget = [];
    var dt;
    var filterType;
    var initDatatable = function(){
        let columns = [
            {data: 'name',orderable: true,
                render:(data,type,row)=> {
                    let name = data;
                    // if(row.accno) name += '-' + row.accno;
                    return `<a href="javascript:;" class="text-gray-500 text-hover-primary" kt-data-trans>${name}</a>`;
                }
            },
            // {data: function(row,type,set){ return (row.finance)?row.finance.code:''}},
            {data: 'amt',className: 'text-end', render:(data,type,row)=>`<span class="text-gray-600">${currency(data,'0.00')}</span>`},
            {data: '',render: (data, type, row) => `<button type="button"class="btn btn-sm btn-icon btn-light btn-active-light-primary toggle h-25px w-25px" kt-table-action="edit_row"><i class="ki-duotone ki-pencil"><i class="path1"></i><i class="path2"></i></i></button>`}
        ], columnDefs = [
            {targets: [1,2], orderable: false, className: 'text-end'}
            // {targets: [0],orderable: true,render:(data,type,row)=> {
            //     let name = data;
            //     if(row.accno) name += '-' + row.accno;
            //     return `<a href="javascript:;" class="text-dark text-hover-primary" kt-data-trans>${name}</a>`;
            // }},
            // {targets: [1,2],orderable: false},
            // {targets: [1],  className: 'text-center',render:(data,type,row)=>`<span class="badge py-3 px-4 fs-7 badge-light-success">${data}</span>`},
            // {targets: 2,  },
            // {targets: -1, orderable: false, className: 'text-end'}
        ]
        dt = kt_DT({
            len:10,
            // menu:[[6,10, 25, 50, -1],[6,10, 25, 50, 'All']],
            server:true,
            url:APP_URL + 'conf/bank/?json=1',
            order: [[0, 'asc']],
            el:'#kt_table_bank',
            columns:columns,
            columnDefs:columnDefs,
            handleActionButton:handleActionButton,
        })
    }
    var handleSearchDatatable = function () {
        const filterSearch = document.querySelector('[data-kt-docs-table-filter="search"]');
        const btnAddnew = document.querySelector('[kt-bank-add]');
        // const btnHome = document.querySelector('[kt-back-home]');
        const btnTrnsAdd = document.querySelector('[kt-trans-addnew]');
        filterSearch.addEventListener('keyup', function (e) {
            dt.search(e.target.value).draw();
        });
        btnAddnew.addEventListener('click',e=>{
            e.preventDefault();
            swaHtml( 'Tambah Baru',htmlEl(),function(el){
                let form = document.getElementById('swaform')
                let formSerial = $(form).serializeArray()
                let param = formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )

                return $.post(APP_URL+'conf/bank/',param).then(res => {
                    if(res.success) return res
                    console.error(res);
                    return Swal.showValidationMessage(res.error)
                })
            },{
                custbtn:'Tambah',
            }).then(res => {
                if(!res.isConfirmed) return;
                dt.ajax.reload();
            })
        })
        // btnHome.addEventListener('click', e => {
        //     e.preventDefault()
        //     openTable(0)
        // })
        btnTrnsAdd.addEventListener('click', e => {
            e.preventDefault()
            let idbank = e.target.getAttribute('idx');
            swaHtml('Transaksi Baru',htmlTranEl(idbank),function(e){
                let form = document.getElementById('swaform')
                let formSerial = $(form).serializeArray()
                let param = formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )

                return $.post(APP_URL+'ledgerbank/',param).then(res => {
                    if(res.success) return res
                    return Swal.showValidationMessage(res.error)
                })
            },{
                custbtn:'Tambah',
            }).then(res => {
                if(!res.isConfirmed) return;
                transData(idbank)
            })
        })
    }
    var handleActionButton = () => {
        const btnAction = document.querySelectorAll('[kt-table-action="edit_row"]');
        btnAction.forEach((b, index) => {
            b.addEventListener('click', e => {
                let data = dt.row( b.closest('tr') ).data();
                let id = data.id;

                e.stopImmediatePropagation();
                e.preventDefault();

                swaHtml( data.name,htmlEl(data),function(el){
                    let form = document.getElementById('swaform')
                    let formSerial = $(form).serializeArray()
                    let param = formSerial.reduce((k,v)=>({ ...k, [v.name]: v.value}), {} )

                    return $.post(APP_URL+'conf/bank/'+id,param).then(res => {
                        if(res.success) return res
                        return Swal.showValidationMessage(res.error)
                    })
                },{
                    custbtn:'Simpan',
                }).then(res => {
                    if(!res.isConfirmed) return;
                    dt.ajax.reload();
                })
            });
        });
        document.querySelectorAll('[kt-data-trans]').forEach(b=>{
            let data = dt.row( b.closest('tr') ).data();
            b.addEventListener('click', async e=>{
                let id = data.id
                let title = data.name
                if(data.accno) title += '-' + data.accno;
                e.preventDefault();
                e.stopImmediatePropagation()
                document.querySelector('[kt-data-trans-title]').innerHTML = title
                document.querySelector('[kt-trans-addnew]').setAttribute('idx',id)
                document.querySelector('[kt-trans-tbody]').innerHTML = ''
                transData(id)
                openTable(1)
            })
        })
    }
    function htmlEl(data){
        let html = `<form id="swaform" autocomplete="off">`;

        if(data) html += `<input type="hidden" name="_method" value="put">`
        else data = {}

        let opt = '<option></option>'
        financeBudget.data.forEach(f=>{
            let select = ''
            opt += `<option value="${f.id}" ${select}>${f.text}</option>`
        })

        html += `<input type="hidden" name="_token" value="${CSRF_TOKEN}">
  <div class="mb-5">
      <label class="form-label fw-bold mb-2">Nama:</label>
      <input type="text" class="form-control" name="name" value="${data.name??''}">
  </div>
  <div class="mb-5">
      <label class="form-label fw-bold mb-2">No Bank:</label>
      <input type="number" class="form-control" name="accno" value="${data.accno??''}">
  </div>
  <div class="mb-5">
      <label class="form-label fw-bold mb-2">Jumlah:</label>
      <input type="number" class="form-control" name="amt" value="${data.amt??0}">
  </div>
</form>`
        return html
    }
    function htmlTranEl(idbank){
        let html = `<form id="swaform" autocomplete="off">`;
        let opt = '<option></option>'
        financeBudget.data.forEach(f=>opt += `<option value="${f.id}">${f.text}</option>`)

        html += `<input type="hidden" name="_token" value="${CSRF_TOKEN}">`
        html += `<input type="hidden" name="bankid" value="${idbank}">`
        html += `
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Tarikh:</label>
    <input type="date" class="form-control" name="txdate">
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Perkara:</label>
    <input type="text" class="form-control" name="description">
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Jumlah:</label>
    <input type="number" class="form-control" name="txamt" value="0">
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Jenis</label>
    <select class="form-select" name="txtype" data-dropdown-parent=".swal2-modal" data-placeholder="Pilih">
      <option value="">Pilih</option>
      <option value="1">Debit</option>
      <option value="2">Credit</option>
    </select>
</div>
<div class="mb-5">
    <label class="form-label fw-bold mb-2">Status</label>
    <select class="form-select" name="txsts" data-dropdown-parent=".swal2-modal" data-placeholder="Pilih">
      <option value="1">Baki Mula</option>
      <option value="2" selected>Transaksi</option>
      <option value="3">Tutup</option>
    </select>
</div>
</form>`
        return html
    }
    async function transData(id){
        let tbody = document.querySelector('[kt-trans-tbody]')
        let res = await $.get(APP_URL+'ledgerbank/?idbank='+id)
        document.querySelector('[kt-data-trans-total]').innerHTML = res.total
        tbody.innerHTML = res.data.map(d => {
            let cls = ''
            if(d.txamt<0) cls = 'text-danger'
            return `<tr class="${cls}">
              <td class="text-center">${d.txdate}</td>
              <td>${d.description}</td>
              <td class="text-end fw-bolder">${d.amtDisp}</td>
            </tr>`
        }).join('')
    }
    function openTable(pg){
        return;
        let block = document.querySelectorAll('[page-block]')
        block.forEach(b => {
            let idx = b.getAttribute('page-block')
            let title = b.getAttribute('title')
            b.classList.add('d-none')
            if(pg == idx) {
                b.classList.remove('d-none');
                document.querySelector('[toolbar-title]').innerHTML = title
            }
        })
    }
    return {
        init:async function(){
            financeBudget = await $.get(APP_URL + 'conf/budget/getbudget')
            openTable(0)
            initDatatable()
            handleSearchDatatable()
        }
    }
}()

document.addEventListener("DOMContentLoaded", () => {
    kt_banks.init();
});
