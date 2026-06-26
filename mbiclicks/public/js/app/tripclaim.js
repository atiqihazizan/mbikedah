
KTPetition.tripclaim = function () {
    var form;
    var taskdaily
    var initForm = async function(){
        document.querySelector('#addTask').addEventListener('click',function(e){
            let tarikh = document.querySelector('.tarikh').value
            let dari = document.querySelector('.dari').value
            let hingga = document.querySelector('.hingga').value
            let perkara = document.querySelector('.perkara').value
            let jarak = document.querySelector('.jarak').value
            let dp = {tarikh: tarikh, perkara: perkara.trim(), slug:MD5(tarikh+dari+hingga),jarak:jarak}
            let bodyTask = taskdaily.value;
            let arr = [];
            e.preventDefault()

            try {
                if(tarikh.length == 0) throw 'Tarikh diperlukan'
                // if(masa.length == 0) throw 'Masa diperlukan'
                if(dari.length == 0) throw 'Masa mula diperlukan'
                if(hingga.length == 0) throw 'Masa hingga diperlukan'
                if(perkara.length == 0) throw 'Perkara diperlukan'
                if(jarak.length == 0) throw 'Jarak diperlukan'
                if(bodyTask.lastIndexOf(dp.slug) != -1) throw 'Item tersebut sudah ditambah'
                if(bodyTask.length > 0) arr = JSON.parse(bodyTask)

                let startTime = moment(tarikh + ' ' + dari)//.format('DD-MM-YYYY hh:mm')
                let endTime = moment(tarikh + ' ' + hingga)//.format('DD-MM-YYYY hh:mm')
                // var duration = moment.duration(endTime.diff(startTime));
                // var hours = duration.asHours(); // lebih kepada perpuluhan
                var hours = endTime.diff(startTime,'hours')

                if(hours<1) throw 'Waktu tidak boleh betul'
                if(hours<5) hours = 4
                dp.masastart = startTime.format('HH:mm')//moment(start,'HH:mm').format('HH:mm')
                dp.masaend = endTime.format('HH:mm')//moment(end,'HH:mm').format('HH:mm')
                dp.days = hours > 4?1:0.5;
                // kiraan jarak menggunakan bacaan odo meter
                if( isNaN(dp.jarak) ) throw 'Jarak tidak betul'
                if( dp.jarak < 50 ) throw 'Jarak tidak kurang dari 50km'

                // append dalam array dan table
                arr.push(dp)
                // document.querySelectorAll('input').forEach(e=>e.value = '')
                taskdaily.value = JSON.stringify(arr)
                redrawTask()
            } catch (e) {swaError(e)}
        })

        let chk = document.querySelector('[name="chkclaimempty"]')
        let iclaim = document.querySelectorAll('.item-claim')
        chk.value = ''
        iclaim.forEach(c=>{
            c.addEventListener('keyup',function(){
                chk.value = '';
                iclaim.forEach(e => {if(e.value.trim() != '') chk.value = 1;})
            })
        })
    }
    function redrawTask(){
        let body = document.querySelector('#tbody_task')
        let obj = taskdaily.value ? JSON.parse(taskdaily.value):[];
        let count = 0;

        body.innerHTML = obj.map((t,n)=>{
            count += t.days;
            form.elements["body[totaldays]"].value = count;
            let day = t.days + ' hari'
            if(t.days == 0.5) day = '1/2 hari'
            return `<tr>
<td class="text-center"><input type="hidden" name="body[taskdetail][${n}][tarikh]" readonly value="${t.tarikh}"/>${moment(t.tarikh).format('DD-MM-YYYY')}</td>
<td class="text-center"><input type="hidden" name="body[taskdetail][${n}][masastart]" readonly value="${t.masastart}"/>${moment(t.masastart,'HH:mm').format('hh:mm A')}</td>
<td class="text-center"><input type="hidden" name="body[taskdetail][${n}][masaend]" readonly value="${t.masaend}"/>${moment(t.masaend,'HH:mm').format('hh:mm A')}</td>
<td class="text-center"><input type="hidden" name="body[taskdetail][${n}][days]" readonly value="${t.days}"/>${day}</td>
<td class=""><input type="hidden" name="body[taskdetail][${n}][perkara]" readonly value="${t.perkara}"/>${t.perkara}</td>
<td class="text-end"><input type="hidden" name="body[taskdetail][${n}][jarak]" readonly value="${t.jarak}"/>${t.jarak} km</td>
<td class="text-end w-30px">
  <a href="#" class="btn-del-task" idx="${n}"><span class="fa fa-times text-danger"></span></a>
</td>
</tr>`}).join('')

        body.querySelectorAll('tr td .btn-del-task').forEach(b=>{
            b.addEventListener('click',e=>{
                let idx = b.getAttribute('idx')
                e.preventDefault()
                obj.splice(idx,1)
                taskdaily.value = JSON.stringify(obj).replace("\\")
                redrawTask()
            })
        })
    }
    return {
        init: function () {
            form = document.querySelector('#kt_modal_petition_form');
            taskdaily = form.elements.chktaskdaily
            initForm();
            redrawTask()
        },
        validity: function(){

            return {
                'chktaskdaily': {validators: {notEmpty: {message: 'Butiran Kerja diperlukan'}}},
                'chkclaimempty': {validators: {notEmpty: {message: 'Tuntutan tidak lengkap'}}}
            }
        },
    };
}();

// KTUtil.onDOMContentLoaded(function() {
//     KTPetition.tripclaim.init();
// })
