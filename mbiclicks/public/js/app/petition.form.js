
function pNew(type){
    let o = KTPetition[type].prop
    if(typeof o.init === 'function') o.init();
    o.form.reset();
    o.modal.show();
    let ptlist = document.querySelectorAll('[name="plist"]')
    ptlist.forEach(i => i.value = '')
}
function pEdit(type,slug){
}
function pDel(type,slug){
    let url = APP_URL + 'petition/' + slug
    let c = confirm('Anda pasti hendak buang permohonan ini?');
    if(!c) return;
    $.post(url,{_method:'delete',_token:CSRF_TOKEN}).done(function(res,status){
        if(res.success)KTPetition.main.redraw()
    }).fail(function(err){
        console.log(err)
    })
}
function pAttach(form,stepper){
    $(form.querySelector('.attachment')).on('change', function(e){
        let slug = form.querySelector('[name="pttid"]').value;
        let file = this;
        let ufile = file.files[0];
        let filePath = file.value;
        let url = APP_URL + 'petition/'+slug+'/addattach';
        let fd = new FormData()

        fd.append('attach',file.files[0])
        fd.append('_token',CSRF_TOKEN)

        file.value = null;
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
        if(!allowedExtensions.exec(filePath)) {
            errMsg('Muatnaik fail hendaklah dalam format [pdf,jpeg,jpg,png]',null)
            // alert('Please upload file having extensions .jpeg or .jpg or .png or .pdf only.');
            return false;
        }
        //convert to megabyte
        let t = (ufile.size / 1024 /1024).toFixed(1)
        if(t > 2) {errMsg('Saiz fail tidak boleh melebihi dari 2MB',null);return;}

        fetch(url, {method: 'POST', body: fd})
        .then(function(res){return res.json();})
         .then(function(data){
            if(data.fails) errMsg('Muatnaik dokumen tidak berjaya',data.fails)
            if(data.success) tbodyAttach(stepper,data.success,slug);
        })
    });
}
function pSave(form,stepperObj,slugNew,stepper,validations){
    let slug = form.querySelector('[name="pttid"]').value
    let url = APP_URL + 'petition'
    let dp = $(form).serialize();

    if(slug.length > 1) {
        url = APP_URL + 'petition/' + slug;
        dp += '&_method=PUT'
        if(slug.length<=50) {
            errMsg('Maaf, Permohohan tidak berjaya disimpan','invalid slug : ' + slug)
            return;
        }
    }

    var validator = validations[stepperObj.getCurrentStepIndex() - 1]; // get validator for currnt step
    if (validator) {
        validator.validate().then(function (status) {
            if (status !== 'Valid') return;
            formBtnToggle(stepper,'save',true)

            $.post(url,dp).done(function(res,status){
                formBtnToggle(stepper,'save',false)
                try {
                    if(!res.success) throw res;
                    form.querySelector('[name="pttid"]').value = res.id;
                    stepperObj.goNext();
                    slugNew = false
                    KTPetition.main.redraw()
                } catch (e) {
                    if(e.error) errMsg(Object.values(e.error).join(','),e)
                }
            }).fail(function(err){
                formBtnToggle(stepper,'save',false)
                errMsg('Rekod tidak berjaya simpan',err.responseJSON)
            })
        });
    }
}
function pSubmit(form,modal,stepper){
    let slug = form.querySelector('[name="pttid"]').value
    let url = APP_URL + 'petition/' + slug + '/submit';
    let dp = $(form).serialize()
    swaConfirm('Anda pasti?','Permohonan yang dihantar tidak boleh diubah lagi','Ya, hantar').then( res => {
        if (res.isConfirmed) {
            // Swal.fire(
            //     'Deleted!',
            //     'Your file has been deleted.',
            //     'success'
            // )
            if(slug.length<=50) return errMsg('Maaf, Permohohan tidak berjaya hantar','Error slug invalid')
            formBtnToggle(stepper,'submit',true)
            $.post(url,dp).done(function(res,status){
                formBtnToggle(stepper,'submit',false)
                try {
                    if(!res.success) throw res;
                    modal.hide();
                    KTPetition.main.redraw()
                } catch (e) {
                    if(e.error) errMsg(Object.values(e.error).join(','),e)
                }
            }).fail(function(err){
                formBtnToggle(stepper,'submit',false)
                errMsg('Maaf, Permohonan tidak berjaya dihantar',err.responseJSON)
            })
        }
    })

}
function tbodyAttach(stepper,data,slug){
    let items = stepper.querySelector('.dropzone-items')
    let item = items.querySelector('.dropzone-item').cloneNode(true)
    item.removeAttribute('style')

    items.querySelector('.dropzone-clone').innerHTML = data.map(function(i,n){
        let link = item.querySelector('[data-dz-name]')
        item.querySelector('.dropzone-delete').setAttribute('idx',i.id)
        link.textContent = i.filename
        link.setAttribute('href',APP_URL + 'storage/' + i.path)
        return item.outerHTML
    }).join('')

    items.querySelectorAll('.dropzone-delete').forEach(function(e){
        $(e).on('click',function(k){
            let idx = $(this).attr('idx')
            $.post(APP_URL + 'petition/' + slug + '/delattach',{id:idx,_token: CSRF_TOKEN})
              .done(function(res,status){if(res.success)tbodyAttach(stepper,res.success,slug)})
              .fail(function(err){console.log(err)})
        })
    })
}
function getDayDiff(form){
    let d1 = form.querySelector('.dtback[type="date"]').value;
    let d2 = form.querySelector('.dtout[type="date"]').value;
    let dtout = new Date(d2);
    let dtback = new Date(d1);
    if(isNaN(dtback) || isNaN(dtout)) return;
    diff_days(dtback,dtout);
    form.querySelector('.tday').value = diff_days(dtout,dtback);// + ":" + min.substring(0,2);
    // form.querySelector('.dday').textContent = diffDay + ' hari'
}
function formBtnToggle(stepper,name,flag){
    let formBtn = stepper.querySelector('[data-kt-stepper-action="'+name+'"]');
    if(flag){
        formBtn.disabled = true;
        formBtn.setAttribute('data-kt-indicator', 'on');
    } else {
        formBtn.removeAttribute('data-kt-indicator');
        formBtn.disabled = false;
    }
}
function errMsg(txt,err){
    if(err) console.log(err)
    swaError(err)
}
