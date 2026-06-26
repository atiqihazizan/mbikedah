
KTPetition.perjalanan = function () {
    var form;
    var initForm = async function(){
        let staffid = form.elements.staff_id.value;
        let needs = await $.get(APP_URL+'necessity/all?staff='+staffid)
        $(form.querySelectorAll('[type="date"]')).on('change',e=>getDayDiff(form))
        form.querySelector('.need-item').addEventListener('change',function(e){
            let item = needs.item[this.value]??[]
            form.querySelector('.need-desc').innerHTML = (Object.values(item)).map(i=>{return `<option value="${i.id}">${i.item}</option>`}).join('')
        })
        $(form.querySelector('.need-add')).on('click',function(){
            let cate = form.querySelector('.need-item').value;
            let item = form.querySelector('.need-desc').value;
            let desc = form.querySelector('.need-value').value;
            let aCate = needs.cate[cate]
            let aItem = needs.item[cate][item]
            let slug = MD5(cate+item);
            let arr = [];
            let dp = {id:aItem.id,cate:aCate.item, item:aItem.item,type: aCate.ntyp,
                desc:desc, slug:slug,parent:parseInt(aItem.parent),vtype:aItem.verifycode,verified:''}

            if(aItem.onlyone) {
                slug = MD5(cate);
                dp.slug = slug;
                dp.vehicle = parseInt(form.elements['body[vehicle]'].value)
            }
            try {
                if(cate.length == 0) throw 'Ketegori diperlukan'
                if(item.length == 0) throw 'Item diperlukan'
                if((form.elements['plist'].value??'').lastIndexOf(slug)!= -1) throw 'Item tersebut sudah ditambah'
                if(form.elements['plist'].value) arr = JSON.parse(form.elements['plist'].value??"[]");
                arr.push(dp);
                form.elements['plist'].value = JSON.stringify(arr);
                form.querySelectorAll('.reset').forEach(e=>{e.value = ''})
                form.querySelector('.need-desc').innerHTML = '';
                tbodyDemand();
            } catch (e) {
                swaError(e)
            }
        })

        let vhcId = form.elements['body[car][id]']
        let vhcDrv = form.elements['body[car][driver]']
        let stsVhc = form.elements['body[vehicle]']
        if(!stsVhc.checked){
            vhcId.disabled = true;
            vhcDrv.disabled = true;
        }
        stsVhc.addEventListener('change',function(e){
            let isChkd = e.target.checked;
            let car = document.querySelector('.validity-car')
            let carLabel = document.querySelector('.validity-car-label')
            vhcId.disabled = !isChkd;
            vhcDrv.disabled = !isChkd;
            if(car.classList.contains('fv-row')) {
                car.classList.remove('fv-row');
                carLabel.classList.remove('required');
            }
            if(isChkd){
                car.classList.add('fv-row')
                carLabel.classList.add('required')
                vhcId.value = ''
                vhcDrv.checked = false
            }
        })
    }
    function tbodyDemand(){
        let data = form.elements['plist'].value==''?[]:JSON.parse(form.elements['plist'].value)
        let tbody = form.querySelector('.tbody-need')
        tbody.innerHTML = data.map(function(i,n){
            return `
            <tr class="align-middle">
              <td class="ps-3">${i.cate}</td>
              <td class="ps-4">${i.item??''}</td>
              <td class="pe-4">${i.desc??''}</td>
              <td class=""><a href="#" class="btn btn-danger btn-sm btn-icon h-30px w-30px need-del" idx="${n}"><i class="fa fa-trash p-0"></i> </a></td>
            </tr>`;
        }).join('');

        $(tbody.querySelectorAll('.need-del')).on('click',function(){
            let id = $(this).attr('idx')
            data.splice(id,1)
            form.elements['plist'].value = JSON.stringify(data);
            tbodyDemand()
        })
    }
    return {
        // Public Functions
        init: function () {
            form = document.querySelector('#kt_modal_petition_form');
            initForm();
            tbodyDemand()
        },
        validity: function(){
            let frm = document.querySelector('#kt_modal_petition_form');
            let stsVhc = frm.elements['body[vehicle]']
            let valid = {
                'body[dtout]': {validators: {notEmpty: {message: 'Tarikh keluar diperlukan'}}},
                'body[dtback]': {validators: {notEmpty: {message: 'Waktu keluar diperlukan'}}},
                'body[num]': {
                    validators: {
                        notEmpty: {message: 'Tarikh pergi dan kembali diperlukan'},
                        callback : {
                            // message: 'Tarikh pergi dan kembali tidak boleh sama',
                            callback: function(input){
                                if(input.value == '') return true;
                                if(input.value < 1) return {valid:false,message:'Tarikh kembali tidak boleh kebelakang dari tarikh pergi'};
                                return true;
                            }
                        }
                    }
                },
                'body[location]': {validators: {notEmpty: {message: 'Lokasi diperlukan'}}},
                'body[addr]': {validators: {notEmpty: {message: 'Alamat diperlukan'}}},
                'body[urusan]': {validators: {notEmpty: {message: 'Urusan diperlukan'}}}
            }
            if(stsVhc.checked) valid['body[car][id]'] = {validators: {notEmpty: {message: 'Kenderaan diperlulan',},},}
            return valid
        }
    };
}();
