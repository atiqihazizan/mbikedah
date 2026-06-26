<?php

namespace App\Traits;

use App\Models\Allowance;

trait AllowanceTraits
{
    public function alwnList(){
        $raw = Allowance::all();
        $type = [];
        $item = [];
        foreach ($raw as $r){
            if($r->parent == 0) $type[] = $r;
            if($r->parent > 0) $item[$r->parent][] = $r;
        }
        return (object)['type'=>$type,'item'=>$item];
    }
}
