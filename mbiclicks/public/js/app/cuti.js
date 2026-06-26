
KTPetition.cuti = function () {
    var form;
    return {
        init: function () {
            form = document.querySelector('#kt_modal_petition_form');
            $(form.querySelectorAll('[type="date"]')).on('change',e=>getDayDiff(form))
        },
        validity: function(){

            return {
                typlv: {validators: {notEmpty: {message: 'Jenis perlepasan diperlukan'},}},
                'body[dtout]': {validators: {notEmpty: {message: 'Tarikh keluar diperlukan'}}},
                'body[dtback]': {validators: {notEmpty: {message: 'Waktu keluar diperlukan'}}},
                'body[num]': {
                    validators: {
                        notEmpty: {message: 'Tarikh bercuti tidak boleh sama'},
                        callback : {
                            message: 'Tarikh bercuti tidak boleh sama',
                            callback: function(input){
                                if(input.value == '' || input.value == 0) return {valid:false,message:'Tarikh bercuti tidak boleh sama'};
                                if(input.value < 0) return {valid:false,message:'Tarikh kembali tidak boleh kurang dari tarikh mula cuti'};
                                return true;
                            }
                        }
                    }
                },
                'body[reason]': {validators: {notEmpty: {message: 'Sebab cuti diperlukan'}}}
            }
        },
    };
}();

// KTUtil.onDOMContentLoaded(function() {
//     KTPetition.cuti.init();
// })
