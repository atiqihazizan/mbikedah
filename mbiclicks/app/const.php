<?php
define('ROLE_FINANCE',1);
define('ROLE_HR',2);

define('YEAR_NOW',date('Y'));
define('MONTH_NOW',(int)date('m'));
define('YRMTH',date('Ym'));
define('DATENOW',date('Y-m-d'));

define('ALLOWANCE_LEVEL',['Select','Tahap 1','Tahap 2','Tahap 3','Tahap 4']);
define('MAN_CATEGORY',['Select','HOD','Manager and Assistant Manager','Senior Executive and Executive','Penolong Executive dan kebawah']);
define('MAN_SERVICE',['Select',[1,2,3],[4,5,6],[7,8,9],[10,11,12]]);

define('TREATMENT',[['id'=>'1','value'=>'Optikal'],['id'=>'2','value'=>'Pergigian'],['id'=>'3','value'=>'"Supplement" & Vitamins']]);

define('PREPARED',1);
define('ENDORSE_KJ',2);
define('ENDORSE_PHR',3);
define('ENDORSE_KHR',4);
define('ENDORSE_PKW',5);
define('ENDORSE_KKW',6);
define('ENDORSE_CEO',7);
define('ENDORSE_PAY',8);
define('ENDORSE_VFY',9); // pegawai pengesahan kewangan
define('ENDORSE_VHCL',10);
define('RETURN_CAR',11); // PREPARED_CLM

define('PREFIX_ACC','yr_acc_');

define('APP_STATUS',['','DRAF','DIPROSES','SELESAI','TUNTUTAN','DIKEMBALIKAN']);
define('STS_APPLY',1);
define('STS_PROCESS',2);
define('STS_FINISH',3);
define('STS_REJECT',6);
//define('STS_CLAIM',4);
define('STS_RETURN',5);

define('LOG_DISP',['','','','DISAHKAN','DISEMAK','BAYAR','TIDAK LULUS','SEMAK SEMULA','DILULUS','','','']);
define('LOG_DISP_HR',['','','','LULUS','SEMAK','BAYAR','TIDAK LULUS','SEMAK SEMULA','LULUS','','','']);
define('LOG_STATUS',['','MULA DRAF','HANTAR','DISAHKAN','DISEMAK','DIBAYAR','TIDAK LULUS','SEMAK SEMULA','DILULUSKAN','SELESAI','TUNTUTAN','PEMULANGAN']);
define('LOG_PENDING',['','DRAF','UNTUK HANTAR','TUNGGU PENGESAHAN','TUNGGU SEMAKAN','PROSES BAYAR','TIDAK LULUS','SEMAK SEMULA','DILULUSKAN','PROSES BAYAR','TUNTUTAN','PEMULANGAN']);
define('LOG_STATUS_HR',['','MULA DRAF','HANTAR','DILULUSKAN','DISEMAK','DIBAYAR','TIDAK LULUS','SEMAK SEMULA','DILULUSKAN','SELESAI','TUNTUTAN','PEMULANGAN']);
define('LOG_STATUS_COLOR',['','primary','warning','success','success','success','danger','danger','success','success','info','warning']);
define('LOGSTS_DISP',[[],LOG_DISP,LOG_DISP_HR]);
define('LOGSTS_VIEW',[[],LOG_STATUS,LOG_STATUS_HR]);
define('LOGSTS_APPLY',1);
define('LOGSTS_SUBMITED',2);
define('LOGSTS_VERIFIED',3);
define('LOGSTS_CHECKED',4);
define('LOGSTS_PAID',5);
define('LOGSTS_REJECTED',6);
define('LOGSTS_RETURN',7);
define('LOGSTS_APPROVED',8);
define('LOGSTS_COMPLETED',9);
define('LOGSTS_CLAIM',10);
define('LOGSTS_GIVEBACK',11);

// action 1:edit 2:del 3:approv/verify 4:return 5:reject 6:print and approve
define('ACTION_EDIT',1);
define('ACTION_DELT',2);
define('ACTION_APRV',3);
define('ACTION_RETN',4);
define('ACTION_REJT',5);
define('ACTION_PRNT',6);

define('TRNSTS_OPENING',1);
define('TRNSTS_TRANSACTION',2);
define('TRNSTS_CLOSING',3);

define('TYPDEBIT',1);
define('TYPCREDIT',2);

define('PAY_TYPE_CHEQUE',1);
define('PAY_TYPE_ONLINE',2);
define('METHOD_PAY',['Belum Bayar','Cheque','Online']);
