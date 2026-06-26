"use strict";
var kt_main = function(){
    function notify(){
        $.get(APP_URL+'activity/pending/count').done(res => {
            let notiEl = document.getElementById('badger_notiactivity')
            let cnt = res.count * 1
            notiEl.textContent = cnt
            if(cnt === 0) notiEl.classList.add('d-none');
            else notiEl.classList.remove('d-none')
        })
    }
    return {
        init: function(){
            // $.get(APP_URL + 'activity/pending/data').done(res=>{
            //     let badge = document.getElementById('badger_notiactivity')
            //     if(!res.data) return;
            //     if(res.count === 0 && !badge.classList.contains('d-none')) badge.classList.add('d-none')
            //     if(res.count > 0 && badge.classList.contains('d-none')) badge.classList.remove('d-none')
            //     badge.textContent = res.count;
            // })
            notify()
        },
        notify:notify
    }
}()
document.addEventListener("DOMContentLoaded", () => {
    kt_main.init();
});
