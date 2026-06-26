
KTPetition.benefit = function () {
    var form;
    var initForm = function(){
        $(form.querySelectorAll('.treatment[type="checkbox"]')).on('change',function(){
            let treat = [];
            form.querySelectorAll('.treatment[type="checkbox"]').forEach(function(c){
                if(!$(c).prop('checked')) return
                treat.push($(c).val());
            })
            form.querySelector('[name="body[treatment]"').value = treat.join(',');
        })
    }
    return {
        // Public Functions
        init: function () {
            form = document.querySelector('#kt_modal_petition_form');
            initForm();
        },
        edit: function(slug){
            let treat = form.querySelector('[name="body[treatment]"').value.split(',')
            treat.forEach(function(c){form.querySelector('.treatment[value="' + c + '"]').checked = true;})
        },
        validity: function(){

            return {
                typlv: {validators: {notEmpty: {message: 'Jenis perlepasan diperlukan'},}},
                'body[treatment]': {validators: {notEmpty: {message: 'Jenis rawatan diperlukan'}}},
                'body[claimant]': {validators: {notEmpty: {message: 'Tuntutan oleh diperlukan'}}},
                // 'body[relation]': {validators: {notEmpty: {message: 'Hubungan diperlukan'}}},
                'body[item]': {validators: {notEmpty: {message: 'Item bagi rawatan diperlukan'}}},
                'body[totalamt]': {
                    validators: {
                        notEmpty: {message: 'Jumlah diperlukan'},
                        numeric: {
                            message: 'Jumlah dalam nombor sahaja',
                            thousandsSeparator: ',',
                            decimalSeparator: '.',
                        },
                        callback: {
                            message: 'Jumlah tidak dinyatakan',
                            callback: function(input){
                                if(input.value == '') return true;
                                if(input.value < 1) return false
                                return true;
                            }
                        }
                    }
                },
            }
        },
    };
}();

// KTUtil.onDOMContentLoaded(function() {
//     KTPetition.benefit.init();
// })
