<?php

use App\Models\Depart;
use App\Models\Staff;

if(!function_exists('colmth')){
    function colmth($class='',$amt=0){
        return '<td class="text-end col-amt '.$class.'">'.number_format($amt,2).'</td>';
    }
}

function trHeadObj ()
{
    return '
        <tr>
    <th style="width: 20px">BIL</th>
    <th style="width: 95px">KOD AKAUN</th>
    <th>PERIHAL</th>
    <th style="text-align: right; width: 100px">ANGGARAN</th>
</tr>';
}

function trObj ( ...$arg )
{
    return '
      <tr>
    <td class="text-center">' . $arg[0] . '</td>
    <td class="text-center">' . $arg[1] . '</td>
    <td>' . $arg[2] . '</td>
    <td class="text-end">' . number_format($arg[3], 2) . '</td>
</tr>';
}

if(!function_exists('rowFooter')) {
    function rowFooter ( $title, $amth, $total )
    {
        if(!count($total)) return '';
        $tr = '<tr class="fw-bold">
                    <th colspan="2" class="footer fw-bold">JUMLAH ' . $title . '</th>';
        foreach ( $amth as $m ) $tr .= colmth('footer fw-bold', $total[$m] ?? 0);
        $tr .= '</tr>';
        return $tr;
    }
}
if(!function_exists('build_tree')){
    function build_tree(&$a, $parent=0){
        $tmp_array = array();
        foreach($a as $obj)
        {
            if($obj['idparent'] == $parent)
            {
                // The next line adds all children to this object
//                $obj['children'] = $this->build_tree($a, $obj['id']);
                $o = build_tree($a, $obj['id']);
                $tmp_array[] = (object) $obj;
                $tmp_array = array_merge($tmp_array,$o);
            }
        }
        // You *could* sort the temp array here if you wanted.
        return $tmp_array;
    }
}
function array_insert(&$array, $value, $index){
    return $array = array_merge(array_splice($array, max(0, $index - 1)), array($value), $array);
}
function buildTree( $list){
    $grouped = [];
    foreach ($list as $node){
        $grouped[$node->pid][] = $node;
    }

    $fnBuilder = function($siblings) use (&$fnBuilder, $grouped) {
        foreach ($siblings as $k => $sibling) {
            $id = $sibling->id;
            if(isset($grouped[$id])) {
                $sibling->children = $fnBuilder($grouped[$id]);
            }
            $siblings[$k] = $sibling;
        }
        return $siblings;
    };

    return $fnBuilder($grouped[0]);
}
function master(){
    try{
        $staff = aData(Staff::orderBy('fullname')->get(),'id');
        $depart = aData(Depart::all(),'id');
//        $step = aData(\App\Models\Stepper::all(),'id'); //stval
//        $ptype = aData(\App\Models\Ptype::all(),'id');
        $lvtype = aData(\App\Models\Leave::orderBy('sort')->get(),'id');
//        $claims = aData(\App\Models\Allowance::all()??[],'id');
//        $pos = aData(Position::with('leave')->orderBy('name')->get(),'id');
        $need = aData(\App\Models\Necessity::where('parent',0)->where('actv',1)->get(),'id');
        $urusn = aData(\App\Models\Urusniaga::all(),'id');
//        $cars = aData(\App\Models\Asset::all(),'id');
        $bank = aData(\App\Models\BankMaster::all(),'id');
        return (object) compact('staff','depart','lvtype','need','urusn','bank');
    } catch (\Exception $e){
        return [];
    }
}

function aData($db,$id){
    try {
        $ar = [];
        foreach ($db as $o){$ar[$o->{$id}] = $o;}
        return $ar;
    } catch (\Exception $e){
        return [];
    }
}
