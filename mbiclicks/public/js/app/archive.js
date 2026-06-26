"use strict"
var KTEvents = function(){
    var tableEl;
    var dt;
    var viewEl;
    var initDatatable = function(){
        let columns = [
            { data: 'ptype.name' },
            { data: 'staff.fullname', render:(data,type,row)=>toTitleCase(data) },
            { data: 'remark' },
            { data: 'created_at' },
            { data: null },
        ]
        let columnDefs = [
            {targets: 0,orderable:false, render: function(data,type,row){
                let name = toTitleCase(data)
                let sts = `<div class="ms-2 badge badge-light-success">Lulus</div>`;
                if(data == undefined) sts = '';
                if(data == 4) sts = `<div class="ms-2 badge badge-light-danger">Batal</div>`;
                if(data == 7) sts = `<div class="ms-2 badge badge-light-danger">Tolak</div>`;
                return name + sts
            }},
            {targets: 1, width:'436.25px', orderable:false},
            {targets: 3, className: 'text-end pe-15',orderable:true, render: function(data,type,row){return data }},
            {targets: -1, data: null, orderable: false, className: 'text-end', render: function (data, type, row) {
                    return `<a href="#" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary btn-icon w-30px h-30px" data-kt-data-table>
    <span class="svg-icon svg-icon-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
            <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642
            12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642
            5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533
            15.4343 12.5657Z" fill="currentColor"></path>
        </svg>
    </span>
</a>`
            }},
        ]
        dt = kt_DT({
            len:-1,
            url:APP_URL+'activity/archive/data',
            order: [[3, 'asc']],
            el:'#kt_table_events',
            columns:columns,
            columnDefs:columnDefs,
            dataSrc:function(e){},
            handleActionButton:handleActionButton,
        })
    }
    var handleSearchDatatable = function () {
        const filterSearch = document.querySelector('[data-kt-docs-table-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {dt.search(e.target.value).draw();});
    }
    const handleActionButton = () => {
        const buttons = document.querySelectorAll('[data-kt-data-table]');
        buttons.forEach((button, index) => {
            button.addEventListener('click', e => {
                let data = dt.row( button.closest('tr') ).data();
                let slug = data.petition.slug;
                e.stopImmediatePropagation();
                e.preventDefault();

                $.get(APP_URL+'activity/archive/view/'+slug).done(function(res){
                    let staff = res.staff??{};
                    // console.log(res)

                    if(res.preview){
                        document.getElementById('printout-body').innerHTML = res.preview
                        fraPage('kt-printout-petition')
                        return;
                    }
                    if(res.error){swalErr(res.message,null);return;}
                    if(staff.avatar) $(viewEl.querySelector('#avatar')).attr('src',staff.avatar)
                    if(res.pcate == 1) document.querySelector('[data-kt-type="humanresources"]').classList.add('d-none')
                    if(res.pcate == 2) document.querySelector('[data-kt-type="humanresources"]').classList.remove('d-none')

                    // titleSwa = res.title
                    // elSwa = res.verify

                    $(viewEl.querySelector('#kt_modal_body')).html(res.html)
                    $(viewEl.querySelector('.attn-name')).html(res.title);
                    $(viewEl.querySelector('.staff-depart')).html(toTitleCase(res.depart));
                    $(viewEl.querySelector('.staff-position')).html(toTitleCase(res.position));
                    for (const s in staff) {let el = viewEl.querySelector('.staff-'+s);if(!el) {continue;} dataTypeFormat($(el),staff[s])}
                    leaves(res,viewEl)
                    fraPage('kt-overview-petition')
                })
            });
        });
    }
    function leaves(res,modalElActive){
        let el = modalElActive.querySelector('[kt-leave-list]')
        let lve = res.leave??[];
        if(!el) return;
        el.innerHTML = lve.map(function(l){
            let objEl = modalElActive.querySelector('[kt-leave-data]').cloneNode(true)
            const typ = l.leave_type;
            const take = l.basic - l.limit;
            const max = l.basic;
            const percent = (take/max) * 100
            const fix = percent.toFixed(0);
            objEl.querySelector('[kt-leave-name]').innerHTML = typ.leave
            objEl.querySelector('[kt-leave-percent]').innerHTML = `${take}/${max}`;//fix + '%';
            objEl.querySelector('[kt-leave-bar]').style.width = fix + "%"
            return objEl.innerHTML
        }).join('');
    }
    function addEventClick(){
        $('.btn-verify-cancel').on('click',function(e){ e.preventDefault();fraPage('kt-table-petition')})
        $('#printout').on('click',function(e){ e.preventDefault();printClick('printout-body','Bayaran'); })
    }
    return {
        init: function(){
            initDatatable();
            handleSearchDatatable();
            addEventClick()

            viewEl = document.getElementById('kt-overview-petition')
            tableEl = document.getElementById('kt-table-petition')
        },
        redraw: function(){dt.ajax.reload()},
    }
}();
KTUtil.onDOMContentLoaded(function() {
    KTEvents.init()
})
