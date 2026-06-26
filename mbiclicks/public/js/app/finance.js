"use strict";
var kt_account = function(){
    var finance = [];
    function tableDraw(data){
        return data.map(a => {
            const bclass = 'btn btn-sm btn-icon btn-light toggle h-25px w-25px'
            let code = a.code
            let name = a.name
            let lvl = a.acclvl + 1;
            let atype = a.atype
            let btyp = a.txn
            let gap = a.acclvl>1?a.acclvl * 4:0
            let edit = `<button type="button" class="${bclass} btn-active-light-primary ms-3" kt_edit_acc><i class="fa fa-pencil"></i></button>`
            let del = `<button type="button" class="${bclass} btn-active-light-danger" kt_del_acc><i class="fa fa-trash-alt"></i></button>`
            let act;
            let html;

            if(a.children) del = `<a href="javascript:;" kt_del_acc class="d-none"><i class="fa fa-trash-alt fs-5"></i></a>`
            act = del + edit

            html = `
<tr idx=${a.id}>
    <td class="text-nowrap">
      <span class="ms-${gap}"><a href="javascript:;" class="me-2" kt_add_acc kt_lvl_acc="${lvl}"><i class="fa fa-plus text-primary"></i></a> ${code}</span>
    </td>
    <td>${name}</td>
    <td class="text-end">${atype}</td>
<!--    <td class="text-center"><a href="#" class="cursor-pointer" kt_txn_acc>${btyp}</a></td>-->
    <td class="text-end">${act}</td>
</tr>
`
            if(a.children) html += tableDraw(a.children)
            return html
        }).join('')
    }
    function tbodyRowClick(panel){
        let tbody = panel.querySelector('tbody')

        tbody.querySelectorAll('tr').forEach(r => {
            let idx = r.getAttribute('idx')
            /*r.querySelector('[kt_txn_acc]').addEventListener('click',function(e){
                e.preventDefault()
                $.get(APP_URL + 'conf/finance/'+idx+'/transac').then(res => {
                    let data = res
                    tbody.innerHTML = tableDraw(data)
                    tbodyRowClick(panel)
                })
            })*/
            r.querySelector('[kt_add_acc]').addEventListener('click',function(e){
                e.preventDefault()
                let lvl = this.getAttribute('kt_lvl_acc')
                dialogAcc(panel,'Tambah Item Baru',lvl,idx)
            })
            r.querySelector('[kt_del_acc]').addEventListener('click',async function(e){
                e.preventDefault()
                let data = await $.get(APP_URL+'conf/finance/' + idx)
                swaConfirm('Anda pasti hendak buang',data.code + ' - ' + data.name,'Buang').then(e => {
                    if(!e.isConfirmed) return;
                    let post = {
                        _token:CSRF_TOKEN,
                        id:idx,
                    }

                    $.delete(APP_URL + 'conf/finance/'+idx,post).then(res => {
                        if(res.error) return console.log(res.error);
                        let tbody = panel.querySelector('tbody')
                        tbody.innerHTML = tableDraw(res)
                        tbodyRowClick(panel)
                    })
                })
            })
            r.querySelector('[kt_edit_acc]').addEventListener('click',async function(e){
                let data = await $.get(APP_URL+'conf/finance/' + idx)
                let html ;
                let opt = '<option></option>'

                finance.filter(v=>v.id !== data.id).forEach(f=>{
                    let select = ''
                    if(data.pid === f.id) select = 'selected'
                    opt += `<option value="${f.id}" ${select}>${f.text}</option>`
                })

                html = `
    <div class="mb-5">
        <div class="fw-bold mb-2">Kod Akaun:</div>
        <input type="text" class="form-control" name="code" value="${data.code}" autocomplete="off">
    </div>
    <div class="mb-5">
        <div class="fw-bold mb-2">Perihal:</div>
        <input type="text" class="form-control" name="name" value="${data.name}" autocomplete="off">
    </div>

    <div class="mb-5">
        <label class="form-label fw-bold mb-2">Hubungan</label>
        <select class="form-select" name="pid" data-dropdown-parent=".swal2-modal" data-placeholder="Pilih">${opt}</select>
    </div>

    <div class="pt-5 mb-5">
        <div class="form-check ">
          <input class="form-check-input" type="checkbox" name="currtable" id="update" value="1" checked>
          <label class="form-check-label" for="update">Kemaskini pada akaun tahunan semasa</label>
        </div>
    </div>`
                e.preventDefault();
                swaHtml('Kemaskini Kod Akaun',html,function(el){
                    let name = document.querySelector('input[name="name"]').value
                    let code = document.querySelector('input[name="code"]').value
                    let pid = document.querySelector('select[name="pid"]').value
                    let updt = document.querySelector('input[name="currtable"]')
                    let param = {
                        _method:'put',
                        _token:CSRF_TOKEN,
                        name:name,
                        code:code,
                        acclvl: 1,
                        pid:0,
                    }


                    if(updt.checked) param.curracc = 1;
                    if(pid !== '') {
                        let acc = finance.find(c => c.id === parseInt(pid))
                        param.acclvl = parseInt(acc.acclvl) + 1
                        param.pid = pid;
                    }

                    return $.post(APP_URL+'conf/finance/'+idx,param).then(res => {
                        if(res.error) return Swal.showValidationMessage(res.error)
                        return res;
                    })
                },{custbtn:'Simpan'}).then( res => {
                    if(!res.isConfirmed) return;
                    let tbody = panel.querySelector('tbody')
                    let idx = panel.getAttribute('kt_acc_data')
                    let data = res.value

                    tbody.innerHTML = tableDraw(data)
                    tbodyRowClick(panel)
                })
            })
        })
    }
    function dialogAcc(panel,title,level,pid){
        let html = `
<form id="swaform" autocomplete="off" class="align-content-start" method="post">
    <input type="hidden" name="_token" value="${CSRF_TOKEN}">
    <input type="hidden" name="pid" value="${pid}">
    <input type="hidden" name="acclvl" value="${level}">
    <div class="mb-5">
        <div class="fw-bold mb-2">Kod Akaun:</div>
        <input type="text" class="form-control" name="code">
    </div>
    <div class="mb-5">
        <label class="form-label fw-bold mb-2">Perihal:</label>
        <input type="text" class="form-control" name="name">
    </div>
    <div class="mb-5">
        <div class="fw-bold mb-5">Jenis:</div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="type" id="type1" value="1">
          <label class="form-check-label" for="type1">Debit</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="type" id="type2" value="2">
          <label class="form-check-label" for="type2">Kredit</label>
        </div>
    </div>
    <div class="pt-5 mb-5">
        <div class="form-check text-start">
          <input class="form-check-input" type="checkbox" name="curracc" id="update" value="1" checked>
          <label class="form-check-label" for="update">Kemaskini pada akaun tahunan semasa</label>
        </div>
    </div>
</form>`
        swaHtml(title,html,(el) => {
            let form = document.getElementById('swaform')
            let formSerial = $(form).serializeArray()

            return $.post(APP_URL + "conf/finance/",formSerial).then(res => {
                if(res.error) return Swal.showValidationMessage(res.error)
                return res;
            })
        },{custbtn:'Tambah'}).then(res => {
            if(!res.isConfirmed) return;
            let tbody = panel.querySelector('tbody')
            let data = res.value

            tbody.innerHTML = tableDraw(data)
            tbodyRowClick(panel)
        })
    }
    return {
        init: async function(){
            let tabEl = document.querySelector('[kt_acc_data]')
            let data = await $.get(APP_URL + 'conf/finance?json')
            let tbody = tabEl.querySelector('tbody')
            let financeRes = await $.get(APP_URL + 'finance/getdata')

            finance = financeRes.data
            tbody.innerHTML = tableDraw(data)
            tbodyRowClick(tabEl)

            tabEl.querySelector('[kt_add_acc]').addEventListener('click',function(e){
                e.preventDefault()
                dialogAcc(tabEl,'Tambah Item Baru',1,0)
            })
        }
    }
}()
document.addEventListener("DOMContentLoaded", () => {
    kt_account.init();
});
