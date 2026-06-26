
KTPetition.medical = function () {
    return {
        // Public Functions
        init: function () {},
        validity:function (){
            return {
                typlv: {validators: {notEmpty: {message: 'Jenis perlepasan diperlukan'},}},
                'body[claimant]': {validators: {notEmpty: {message: 'Tuntutan oleh diperlukan'}}},
                // 'body[relation]': {validators: {notEmpty: {message: 'Hubungan diperlukan'}}},
                'body[totalamt]': {
                    validators:{
                        notEmpty: {message: 'Jumlah diperlukan'},
                        numeric: {
                            message: 'Jumlah hendaklah dalam nombor',
                            thousandsSeparator: ',',
                            decimalSeparator: '.',
                        },
                        callback: {
                            message: 'Jumlah tidak boleh kurang dari 1',
                            callback: function(input){
                                if(input.value == '') return true;
                                if(input.value < 1) return false
                                return true;
                            }
                        }
                    }
                },
            }
        }
    };
}();
//
// KTUtil.onDOMContentLoaded(function() {
//     KTPetition.medical.init();
// })
