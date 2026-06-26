<?php
namespace App\Traits;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

trait PreviewTraits {
    private function petitionView($petition,$view = 0){
        $body = $petition->body;
        $ptyp = $petition->ptype;
        $stepper = $petition->stepper;

        if(isset($body->needs)) $body->needs = json_decode($body->needs)??[];
        if(isset($body->treatment)){
            $treat = [];
            $arr = explode(',',$body->treatment);
            foreach(TREATMENT as $t){if(in_array($t['id'],$arr)) $treat[] = $t['value'];}
            $body->treatment = implode(',',$treat);
        }

        $data = [
            'pcate'=>$petition->pcate,
            'staff'=>collect($petition->staff)->only('fullname','staffno','email','avatar')->all(),
            'position'=>$petition->position->name,
            'depart'=>$petition->depart->name,
            'ptype'=> collect($ptyp)->only('code','name')->all(),
            'stepper'=> collect($stepper)->only('id','code','name','todo')->all(),
            'leave' => [],
        ];

        $ptt = (object) collect($petition)->only('id','staff_id','depart_id','stepnow','slug','pdate','pdt','outstanding','tamt','remark','psts','pcate','plist','typlv')->all();
        $body = $petition->body;
        $temp = $this->templateView($ptyp->tmpl,$petition,$view);

        $aPett[] = (object)['label'=>'Tarikh Permohonan','value'=>$ptt->pdt];
        if($ptt->typlv>0) $aPett[] = (object)['label'=>'Jenis Pelepasan/Cuti','value'=>$petition->lvtype->leave];
        $pett = array_merge($aPett,$temp['html']);
        $alwn = $this->alwnList();
        $data['html'] = view('approval.partial._petition',compact('ptyp','ptt','body','pett','alwn'))->render();


        $index = array_search(ENDORSE_PHR,$petition->rulestep);
        if(($petition->plist??[]) || (in_array($petition->ptype_id,[5,7,8]) && count($petition->routestep)>=$index) ) {
            $data['list'] = $petition->plist;
            $cols = $temp['cols'];
            $rows = $temp['rows'];
            $title = $temp['title'];
            $data['html'] .= view('approval.partial._detail', compact('cols','rows','view','title','ptt','body'))->render();
        }
        if($petition->attach->count() > 0){
            $attach = $petition->attach;
            $data['html'] .= view('approval.partial._attachment', compact('attach'))->render();
        }


        $finance_auth = [ENDORSE_PKW,ENDORSE_KKW,ENDORSE_PAY,ENDORSE_CEO,ENDORSE_VFY];
        $finance_allow = false;
        foreach ($finance_auth as $a){if(in_array($a,auth()->user()->ustep)) $finance_allow = true;}
        if(in_array($petition->stepnow,$finance_auth) && $finance_allow){
            $payment = false;
            if(isset($body->payment)) $payment = $body->payment;
            if($payment !== false ) $data['html'] .= view('approval.partial._verified_fnc', compact('payment'))->render();
        }

        if(isset($petition->lvtype)) $data['typlv'] = $petition->lvtype->leave;
        return $data;
    }
    private function templateView($ptyp,$petition,$view = 0){
        $body = $petition->body;
        $cols = [];
        $rows = [];
        $title = '';
        $html=[];
        foreach ($ptyp as $k=>$h){
            $f = $h->field??'';
            if($f == null && $h->type??'' === 'table') {
                $title = $h->label;
                $table = $this->drawTable($h,$view,$petition->plist);
                $rows = $table['rows'];
                $cols = $table['cols'];
            } else {
                if(gettype($f) == 'array'){
                    $h->value = '';
                    foreach($f as $a){
                        if(!isset($body->{$a})) continue;
                        $h->value .= $body->{$a} . ' ';
                    }
                } else {
                    if(isset($body->{$f})) {
                        $dat = $body->{$f}??'';
                        if($h->type != '') $dat = $this->formatValue($h->type,$dat);
                        if(isset($h->db)){
                            $db = DB::table($h->db)->where($h->col,$dat)->first();
                            $name = '';
                            foreach ($h->fieldname as $fn){$name .= $db->{$fn} . ' ';}
                            $dat = $name;
                        }
                        if(isset($h->unit)) $dat .= ' ' . $h->unit;
                        $h->value = $dat;
                    } else {
                        // relation chain
                        $obj = explode('.', $f);
                        $dat = $body->{$obj[0]}??'';
                        // relation chain
                        foreach ($obj as $indx=>$o){
                            if($indx == 0)continue;
                            if(isset($dat->{$o})) {
                                $dat = &$dat->{$o};
                            } else {
                                $dat = '';
                                if($h->type === 'b') $dat = '0';
                                break;
                            }
//                            if($dat->{$o}??'') $dat = &$dat->{$o};
                        }
//                        if(gettype($dat) === 'object') $dat = '';
                        //
                        if($h->type != '') $dat = $this->formatValue($h->type,$dat);
                        if(isset($h->unit)) $dat .= ' ' . $h->unit;
                        $h->value = $dat;
                    }
                }
                $html[] = $h;
            }
        }
        return ['html'=>$html,'cols'=>$cols,'rows'=>$rows,'title'=>$title];
    }
    private function formatValue($typ,$val,$def=''){
        if($val == null) return '';
        if(in_array(gettype($val),['object','array'])) return '';
        if($typ === 'b') {
            if($val == 1) return 'Ya';
            if($val != 1 && strlen($val) > 1) return $val;
            return 'Tidak';
//            return ( (int)$val == 1 || strlen($val) > 1 ) ? $val : 'Tidak';
        }
        if($typ === 'i') return intval($val);
        if($typ === 'c') return number_format($val,2);
        if($typ === 'd') return Carbon::parse($val)->format('d M Y');
        if($typ === 's') return trim($val);
        return $def;
    }
    private function drawTable($h,$view,$listdata){
        $rows = [];
        $cols = [];
        $cls = explode('|',$h->customClass??'');
        $class = [];
        foreach ($cls??[] as $c){
            if($c=='') continue;
            $d = explode(':',$c);
            $idxs = explode(',',$d[0]);
            foreach ($idxs as $i)$class[$i] = $d[1];
        }
        $col = explode('|',$h->column??'');
        foreach($col as $idx => $c) {
            if($c == '') continue;
            if($c == 'render') $c = '';
            $cols[] = [ 'name' => $c, 'class' => $class[$idx] ?? '' ];
        }
        if($view == 1){
            $field = explode('|',$h->data);
            $format = explode(',',$h->format);
            for($l=0; $l<count($listdata??[]); $l++){
                $rows[$l] = [];
                // column data
                $colfield = [];
                for ($f=0; $f<count($field); $f++) {
                    $ff = $field[$f]; $obj = explode('.', $ff);
                    $fdata = $listdata[$l]->{$obj[0]}??'';
                    $colfield[] = $obj[0];
                    // relation chain
                    foreach ($obj as $o){
                        if($fdata->{$o}??[]) $fdata = &$fdata->{$o};
                    }
                    $value = $this->formatValue($format[$f]??'s',$fdata??'');
                    // render column for button or any special DOM
//                            if($obj[0] === 'verify' && $value == '' && $petition->stepnow == 5) $value = 'Untuk Disahkan';
                    //
                    $rows[$l][$f] = $value??'';
//                    unset($fdata);
                }
            }
        }
//        unset($html[$k]);
        return ['rows'=>$rows,'cols'=>$cols];
    }
}
