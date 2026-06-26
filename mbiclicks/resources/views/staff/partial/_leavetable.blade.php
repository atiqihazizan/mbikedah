<table id="kt_customer_view_statement_table_2" class="table align-middle table-row-dashed fs-6 text-gray-600 fw-semibold gy-3">
    <thead class="border-bottom border-gray-200">
    <tr class="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
        <th class="w-300px">Jenis</th>
        <th class="w-100px text-end">Kelayakan</th>
        <th class="w-100px text-end">Telah Ambil</th>
    </tr>
    </thead>
    <tbody>
    @foreach($leave as $t)
        <tr>
            <td class="">{{ $t->leaveType->leave??'' }}</td>
            <td class=" text-end">{{ $t->typ==3?'RM ' .number_format($t->limit,2):$t->limit . ' ' . $t->leaveType->unit }}</td>
            <td class=" text-end">{{ $t->typ==3?'RM ' .number_format($t->taken,2):$t->taken . ' ' . $t->leaveType->unit }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
