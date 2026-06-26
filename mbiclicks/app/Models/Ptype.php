<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ptype extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $fillable = ['name','short','countstep','step','code','shw','cate','lvtyp'];
    protected $hidden = ['created_at','updated_at'];
    protected $casts = [
        'seq1' => 'array',
        'seq2' => 'array',
        'lvtyp' => 'array',
        'tmpl' => 'object',
        'preq' => 'object',
        'tempform' => 'array',
        'validity' => 'object',
    ];

    public function setTmplAttribute($value){$this->attributes['tmpl'] = json_encode($value);}
    public function getleaveAttribute(){return Leave::whereIn('id',$this->lvtyp)->get();}
    public function getLvtypeAttribute(){
        $lvtyp = $this->lvtyp;
        if(empty($lvtyp)) return '';
        $lv = Leave::whereIn('id', $this->lvtyp)->get()->pluck('leave')->join(', ');
        return $lv;
    }
    public function getJsonlvAttribute(){
        $lvtyp = $this->attributes['lvtyp'];
        if(!is_array($lvtyp)) return json_decode($lvtyp);
        return $lvtyp;
    }
    public function getSeqAttribute(){
        $seq1 = $this->attributes['seq1'];
        $seq2 = $this->attributes['seq2'];
        $seq = array_unique(array_merge($seq1,$seq2), SORT_REGULAR);
        if(in_array(0,$seq)) {
            unset($seq[array_search(0, $seq)]);
            unset($seq[array_search(1, $seq)]); // penyediaan
            $seq = array_unique(array_merge($seq,[6,7]), SORT_REGULAR);
        }
        sort($seq);
        return $seq;
    }
}
