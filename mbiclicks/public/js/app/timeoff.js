
KTPetition.timeoff = function () {
    var form;
    var initForm = function(){
        $(form.querySelectorAll('[type="time"]')).on('change',function(){getHourDiff();})
    }

    function getHourDiff(){
        let dout = form.querySelector('.date.out').value;
        let tin = form.querySelector('.in[type=time]').value;
        let tou = form.querySelector('.out[type=time]').value;
        if(tin === '' || tou === '') return;

        let d1 = new Date(dout + ' ' + tou)
        let d2 = new Date(dout + ' ' + tin)
        let count = diff_hours(d2,d1)

        form.querySelector('.totalhr').value = count;// + ":" + min.substring(0,2);
        // form.querySelector('.disp_hr').textContent = count + ' jam'
        // form.querySelector('.btn-submit').prop('disabled',false);
        // if(count>4 || d2<d1 || (tou.split(':'))[0]<7 || (tou.split(':'))[0]>14 || (tin.split(':'))[0]>17) $('.btn-submit').prop('disabled',true);
    }

    return {
        // Public Functions
        init: function () {
            form = document.querySelector('#kt_modal_petition_form');

            $('.timeoff').on('change',function(){
                console.log(3)
                getHourDiff();
            })
        },
        edit: function(slug){
            getHourDiff()
        },
        validity: function(){

            return {
                typlv: {validators: {notEmpty: {message: 'Jenis perlepasan diperlukan'},}},
                'body[date]': {validators: {notEmpty: {message: 'Tarikh keluar diperlukan'},}},
                'body[tout]': {
                    validators: {
                        notEmpty: {message: 'Waktu keluar diperlukan'},
                        callback:{
                            message: 'masa diluar daripada waktu pejabat sahaja',
                            callback: function(input){
                                let val = parseInt(input.value.replace(':',''))/100
                                if(input.value == '') return true;
                                if(val < 8|| val > 17) return false
                                return true;
                            }
                        }
                    }
                },
                'body[tin]': {
                    validators: {
                        notEmpty: {message: 'Waktu masuk diperlukan'},
                        callback:{
                            message: 'masa diluar daripada waktu pejabat sahaja',
                            callback: function(input){
                                let val = parseInt(input.value.replace(':',''))/100
                                if(input.value == '') return true;
                                if(val < 8|| val > 17) return false
                                return true;
                            }
                        }
                    }
                },
                'body[num]': {
                    validators: {
                        notEmpty: {message: 'Waktu keluar dan masuk tidak boleh sama'},
                        callback: {
                            message:'Waktu keluar dan masuk tidak boleh sama',
                            callback: function(input){
                                if(input.value =='') return false;
                                if(input.value == 0) return false
                                if(input.value < 0) return {valid:false,message:'Waktu masuk tidak boleh kurang dari waktu keluar'}
                                if(input.value > 4) return {valid:false,message:'timeoff tidak boleh melebihi dari 4 jam'}
                                return true;
                            }
                        }
                    }
                },
                'body[reason]': {validators: {notEmpty: {message: 'Sebab diperlukan'}}}
            }
        }
    };
}();

// KTUtil.onDOMContentLoaded(function() {
//     KTPetition.timeoff.init();
// })
