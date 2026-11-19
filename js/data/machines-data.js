/**
 * MMS (Maintenance Management System) - MtD Module
 * PT Mitra Mulia Makmur (MMM Plastic)
 * Master Data Mesin Pabrik (248 Unit - 4 Cabang: MMS, MMN, MMG, MMM)
 */
        const masterMachines = [
            { code: 'I11-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I121-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I122-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I123-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I124-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I125-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I126-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I127-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'I12-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I20-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I34-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I35-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I47-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMG' }
            , { code: 'I48-LY305', unitName: 'INJ-48 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMG' }
            , { code: 'I49-LY305', unitName: 'INJ-49 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMG' }
            , { code: 'I89-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMG' }
            , { code: 'APMSA00CLT-07', unitName: 'CLT-07 COOLING TOWER LIANG CHI (LBC 200)', category: 'Utility', branch: 'MMG' }
            , { code: 'APMSA00ADR-02', unitName: 'Air dryer Atlas copco FD120', category: 'Auxiliary', branch: 'MMM' }
            , { code: 'APMSA00ADR-03', unitName: 'Air dryer Kaeser TE-121', category: 'Auxiliary', branch: 'MMM' }
            , { code: 'APMSA00ADR-04', unitName: 'Air dryer Kaeser TE-121', category: 'Auxiliary', branch: 'MMM' }
            , { code: 'IPKSDA1514', unitName: 'MOT-02 MATERIAL VACCUM MOTAN', category: 'Auxiliary', branch: 'MMM' }
            , { code: 'I118-LY305', unitName: 'LIEN YU305', category: 'Injection', branch: 'MMM' }
            , { code: 'I128-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMM' }
            , { code: 'I139 - LY600', unitName: 'INJ-139 INJECTION MOULDING LIEN YU (LYTF600SV 380V)', category: 'Injection', branch: 'MMM' }
            , { code: 'I153-HWD308', unitName: 'HWAMDAÂ 308', category: 'Injection', branch: 'MMM' }
            , { code: 'I155-HWD308', unitName: 'HWAMDAÂ 308', category: 'Injection', branch: 'MMM' }
            , { code: 'I161-HWD308', unitName: 'HWAMDA 308', category: 'Injection', branch: 'MMM' }
            , { code: 'I183-BI650', unitName: 'BORCHE BI650', category: 'Injection', branch: 'MMM' }
            , { code: 'I62-LY555', unitName: 'LIEN YU 555', category: 'Injection', branch: 'MMM' }
            , { code: 'I84-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0038', unitName: 'INJ-117 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0085', unitName: 'INJ-51 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0117', unitName: 'INJ-78 INJECTION MOULDING LIEN YU (LY700SV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0118', unitName: 'INJ-86 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0120', unitName: 'INJ-83 INJECTION MOULDING LIEN YU (LY700SV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0138', unitName: 'INJ-85 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0139', unitName: 'INJ-88 INJECTION MOULDING LIEN YU (LY D-205SV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0140', unitName: 'INJ-87 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0141', unitName: 'INJ-95 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0142', unitName: 'INJ-92 INJECTION MOULDING LIEN YU (LY D-205SV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0143', unitName: 'INJ-93 INJECTION MOULDING LIEN YU (LY D-205SV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0144', unitName: 'INJ-94 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0145', unitName: 'INJ-97 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0146', unitName: 'INJ-98 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0147', unitName: 'INJ-99 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0186', unitName: 'INJ-96 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0187', unitName: 'INJ-103 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0188', unitName: 'INJ-104 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0189', unitName: 'INJ-105 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0190', unitName: 'INJ-106 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0191', unitName: 'INJ-107 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0198', unitName: 'INJ-111-INJECTION MOULDING-VICTOR-VE-140', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0199', unitName: 'INJ-112-INJECTION MOULDING-VICTOR-VE-140', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0200', unitName: 'INJ-113-INJECTION MOULDING-VICTOR-VE-140', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0202', unitName: 'INJ-114-INJECTION MOULDING-VICTOR-VE-140', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0203', unitName: 'INJ-115-INJECTION MOULDING-VICTOR-VE-140', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0204', unitName: 'INJ-108 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0205', unitName: 'INJ-116 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0207', unitName: 'INJ-131 INJECTION MOULDING VICTOR (VR350E)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0210', unitName: 'INJ-132 INJECTION MOULDING VICTOR (VS250F)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0240', unitName: 'INJ-133 INJECTION MOULDING LIEN YU (LY TF600)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0247', unitName: 'INJ-135 INJECTION MOULDING ENGEL (ENGEL 180)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0271', unitName: 'INJ-136 INJECTION MOULDING ENGEL (ENGEL 380)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0272', unitName: 'INJ-134 INJECTION MOULDING ENGEL (ENGEL 380)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0285', unitName: 'INJ-137 INJECTION MOULDING LIEN YU (LYTF300SV 380V)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0286', unitName: 'INJ-138 INJECTION MOULDING LIEN YU (LYTF300SV 380V)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0294', unitName: 'INJ-140 INJECTION MOULDING HWAMDA (HWD-308 ID147W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0295', unitName: 'INJ-141 INJECTION MOULDING HWAMDA (HWD-308 ID145W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0297', unitName: 'INJ-142 INJECTION MOULDING HWAMDA (HWD-308 ID146W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0299', unitName: 'INJ-143 INJECTION MOULDING HWAMDA (HWD-308 ID148W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0301', unitName: 'INJ-144 INJECTION MOULDING HWAMDA (HWD-308 ID143W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0303', unitName: 'INJ-145 INJECTION MOULDING HWAMDA (HWD-308 ID144W)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0364', unitName: 'INJ-179 INJECTION MOULDING HWAMDA (HWD-700M8-SII)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0365', unitName: 'INJ-177 INJECTION MOULDING HWAMDA (HWD-308M8-SPV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0366', unitName: 'INJ-175 INJECTION MOULDING HWAMDA (HWD-308M8-SPV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0367', unitName: 'INJ-176 INJECTION MOULDING HWAMDA (HWD-308M8-SPV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0368', unitName: 'INJ-178 INJECTION MOULDING HWAMDA (HWD-308M8-SPV)', category: 'Injection', branch: 'MMM' }
            , { code: 'MSNSDA0392', unitName: 'PTZ-01 MESIN PALLETIZER TABUNG 5 KG ENGEL', category: 'Injection', branch: 'MMM' }
            , { code: 'APMSA00PRT-12', unitName: 'Transfer print ASTRAN AST', category: 'Printing', branch: 'MMM' }
            , { code: 'ASMSA00PRT-16', unitName: 'Printer KAZE K8000', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0002', unitName: 'PRT-04 PRINTER KASE KLP4W', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0003', unitName: 'PRT-02 PRINTER KASE KSP815', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0008', unitName: 'PRT-03 PRINTER KASE K908H', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0078', unitName: 'PRT-05 PRINTER KASE K808H', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0111', unitName: 'PRT-06 TRANSFER PRINT ASTRAN AST', category: 'Printing', branch: 'MMM' }
            , { code: 'MSNSDA0129', unitName: 'PRT-10 TRANSFER PRINT ASTRAN (AST-C801)', category: 'Printing', branch: 'MMM' }
            , { code: 'P12-TF02', unitName: 'PRT-12 TRANSFER PRINT ASTRAN AST', category: 'Printing', branch: 'MMM' }
            , { code: 'P14-GELAS', unitName: 'PRT-14 PRINTER (NYLO PRINT)', category: 'Printing', branch: 'MMM' }
            , { code: 'APF2503RBT-04', unitName: 'RBT-04 ROBOT TENSO (TEM-1400SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0208', unitName: 'RBT-01 ROBOT JEII-LML-20', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0255', unitName: 'RBT-24 ROBOT TENSO (TES-1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0268', unitName: 'RBT-03 ROBOT E2', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0273', unitName: 'RBT-15 ROBOT TENSO (TEM-1600SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0277', unitName: 'RBT-05 ROBOT TENSO (TEM-1600SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0310', unitName: 'RBT-23 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0315', unitName: 'RBT-32 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0349', unitName: 'RBT-30 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0352', unitName: 'RBT-34 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0361', unitName: 'RBT-36 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0397', unitName: 'RBT-45 ROBOT WELLLIH HSIML-1900-1', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0420', unitName: 'RBT-02 ROBOT E2', category: 'Robot', branch: 'MMM' }
            , { code: 'MSNSDA0437', unitName: 'RBT-16 ROBOT TENSO TES-1200 SNC3P', category: 'Robot', branch: 'MMM' }
            , { code: 'APMSA00CHL-01', unitName: 'Chiller SUPER PC12AC (97097)', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-02', unitName: 'Chiller SUPER PC9AC (97093)', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-03', unitName: 'Chiller MK 150 40067', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-04', unitName: 'Chiller WENSUI 190 321', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-05', unitName: 'Chiller WENSUI 190 325', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-06', unitName: 'Chiller WENSUI 190 326', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-12', unitName: 'Chiller WENSUI 11 20936', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-14', unitName: 'Chiller WENSUI 11 20937', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-21', unitName: 'CHL-21 CHILLER HAKAI HC150 H 350', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-22', unitName: 'CHL-22 CHILLER HAKAI HC150 H 351', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-23', unitName: 'CHL-23 CHILLER HAKAI HC150 H 352', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-24', unitName: 'CHL-24 CHILLER HAKAI HC150 H 353', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-25', unitName: 'CHL-25 CHILLER HAKAI HC150 H 360', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-27', unitName: 'CHL-27 CHILLER HAKAI HC150 H 362', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-28', unitName: 'CHL-28 CHILLER HAKAI HC150 H 363', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-33', unitName: 'Chiller Oasaka Reiken -', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-35', unitName: 'CHL-35 CHILLER HAKAI HC150 H 401', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-37', unitName: 'CHL-37 CHILLER HAKAI HC150 H 406', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-48', unitName: 'CHL-48 CHILLER PIOVAN', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CHL-50', unitName: 'Chiller WENSUI', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CLT-03', unitName: 'CLT-03 COOLING TOWER LIANG CHI (LBC 200)', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CLT-05', unitName: 'CLT-05 COOLING TOWER LIANG CHI (LBC 200)', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00CMP-04', unitName: 'CMP-04 SCREW COMPRESSOR KAESER CSD 125', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00GST-01', unitName: 'GENSET MAN', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00PPA-01', unitName: 'PPA-01 POMPA AIR ALLIANCE (AA250)', category: 'Utility', branch: 'MMM' }
            , { code: 'APMSA00PPA-06', unitName: 'PPA-06 POMPA AIR MAREELI', category: 'Utility', branch: 'MMM' }
            , { code: 'MSNSDA0071', unitName: 'CHL-53 CHILLER', category: 'Utility', branch: 'MMM' }
            , { code: 'MSNSDA0114', unitName: 'CMP-06 SCREW COMPRESSOR KAESER CSD 125', category: 'Utility', branch: 'MMM' }
            , { code: 'MSNSDA0375', unitName: 'CMP-02 SCREW COMPRESSOR ATLAS COPCO GA55+', category: 'Utility', branch: 'MMM' }
            , { code: 'APF2310ADR-09', unitName: 'Air dryer', category: 'Auxiliary', branch: 'MMN' }
            , { code: 'APF2310ADR-10', unitName: 'Air dryer', category: 'Auxiliary', branch: 'MMN' }
            , { code: 'APF242ADR-11', unitName: 'Air dryer', category: 'Auxiliary', branch: 'MMN' }
            , { code: 'APMSA00CRS-01', unitName: 'Crusher', category: 'Auxiliary', branch: 'MMN' }
            , { code: 'APMSA00CRS-08', unitName: 'Crusher', category: 'Auxiliary', branch: 'MMN' }
            , { code: 'EBM01', unitName: 'LESHAN SL2-L5X2-3A', category: 'Injection', branch: 'MMN' }
            , { code: 'I01-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I02-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I03-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I152-HWD1080', unitName: 'HWAMDA 1080', category: 'Injection', branch: 'MMN' }
            , { code: 'I154-HWD308', unitName: 'HWAMDAÂ 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I156-HWD308', unitName: 'HWAMDAÂ 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I157-HWD700', unitName: 'HWAMDA 700', category: 'Injection', branch: 'MMN' }
            , { code: 'I158-HWD700', unitName: 'HWAMDA 700', category: 'Injection', branch: 'MMN' }
            , { code: 'I160-HWD1080', unitName: 'HWAMDAÂ 1080', category: 'Injection', branch: 'MMN' }
            , { code: 'I162-HWD308', unitName: 'HWAMDA 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I163-HWD308', unitName: 'HWAMDA 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I164-HWD308', unitName: 'HWAMDA 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I165-HWD308', unitName: 'HWAMDA 308', category: 'Injection', branch: 'MMN' }
            , { code: 'I166-HWAMDA170', unitName: 'HWAMDA170', category: 'Injection', branch: 'MMN' }
            , { code: 'I167-HWD170', unitName: 'HWAMDA 170', category: 'Injection', branch: 'MMN' }
            , { code: 'I168-HWD170', unitName: 'HWAMDA 170', category: 'Injection', branch: 'MMN' }
            , { code: 'I169-HWD170', unitName: 'HWAMDA 170', category: 'Injection', branch: 'MMN' }
            , { code: 'I170-HWD170', unitName: 'HWAMDA 170', category: 'Injection', branch: 'MMN' }
            , { code: 'I171-HWD268', unitName: 'HWAMDA 268', category: 'Injection', branch: 'MMN' }
            , { code: 'I172-HWD268', unitName: 'HWAMDA 268', category: 'Injection', branch: 'MMN' }
            , { code: 'I173-HWD268', unitName: 'HWAMDA 268', category: 'Injection', branch: 'MMN' }
            , { code: 'I174-HWD320', unitName: 'HWAMDA 320', category: 'Injection', branch: 'MMN' }
            , { code: 'I180-BI400', unitName: 'BORCHE BI400', category: 'Injection', branch: 'MMN' }
            , { code: 'I181-BI500', unitName: 'BORCHE BI500', category: 'Injection', branch: 'MMN' }
            , { code: 'I182-BI500', unitName: 'BORCHE BI500', category: 'Injection', branch: 'MMN' }
            , { code: 'I184-BI800', unitName: 'BORCHE BI800', category: 'Injection', branch: 'MMN' }
            , { code: 'I18-LY555', unitName: 'LIEN YU 555', category: 'Injection', branch: 'MMN' }
            , { code: 'I25-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I26-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I27-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I31-LY555', unitName: 'LIEN YU 555', category: 'Injection', branch: 'MMN' }
            , { code: 'I32-LY125', unitName: 'LIEN YU 125', category: 'Injection', branch: 'MMN' }
            , { code: 'I33-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I37-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I38-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I39-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I40-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I52-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I53-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I54-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I55-LY455', unitName: 'LIEN YU 455', category: 'Injection', branch: 'MMN' }
            , { code: 'I56-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I57-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I58-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I59-LY125', unitName: 'LIEN YU 125', category: 'Injection', branch: 'MMN' }
            , { code: 'I60-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I61-LY255', unitName: 'INJ-61 INJECTION MOULDING LIEN YU (LY255SV)', category: 'Injection', branch: 'MMN' }
            , { code: 'I63-LY455', unitName: 'LIEN YU 455', category: 'Injection', branch: 'MMN' }
            , { code: 'I64-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I69-LY255', unitName: 'LIEN YU 255', category: 'Injection', branch: 'MMN' }
            , { code: 'I70-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I71-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I72-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I73-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I74-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I75-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I76-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I77-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I79-LY305', unitName: 'LIEN YU 305', category: 'Injection', branch: 'MMN' }
            , { code: 'I80-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I81-LY155', unitName: 'INJ-81  INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMN' }
            , { code: 'I82-LY155', unitName: 'LIEN YU 155', category: 'Injection', branch: 'MMN' }
            , { code: 'I90-VC550', unitName: 'VICTOR 550', category: 'Injection', branch: 'MMN' }
            , { code: 'I91-VC550', unitName: 'VICTOR 550', category: 'Injection', branch: 'MMN' }
            , { code: 'IB01-AOKI', unitName: 'AOKI', category: 'Injection', branch: 'MMN' }
            , { code: 'APF2503TNK-1', unitName: 'Tanki', category: 'Lain-lain', branch: 'MMN' }
            , { code: 'BLW-02', unitName: 'BAIXING', category: 'Lain-lain', branch: 'MMN' }
            , { code: 'MSNSDA0345', unitName: 'RBT-25 ROBOT TENSO (1600SNC3P)', category: 'Robot', branch: 'MMN' }
            , { code: 'MSNSDA0363', unitName: 'RBT-33 ROBOT TENSO (1600SNC3P)', category: 'Robot', branch: 'MMN' }
            , { code: 'APF2307-CHL-03C', unitName: 'Chiller Central', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2307-CLT-08', unitName: 'CLT-08 COOLING TOWER LIANG CHI (LRC-N-200-C4)', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2307-CLT-09', unitName: 'CLT-09 COOLING TOWER LIANG CHI (LRC-N-200-C4)', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2307-PPA-17', unitName: 'Pompa air', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2307-PPA-18', unitName: 'Pompa air', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2310CHL-56', unitName: 'Chiller', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2310CMP-10', unitName: 'CMP-10 PISTON COMPRESSOR', category: 'Utility', branch: 'MMN' }
            , { code: 'APF2503CHL-04C', unitName: 'Chiller central', category: 'Utility', branch: 'MMN' }
            , { code: 'APMSA00CHL-10', unitName: 'CHL-10 CHILLER WENSUI 181 00021', category: 'Utility', branch: 'MMN' }
            , { code: 'APMSA00CHL-31', unitName: 'CHL-31 CHILLER HAKAI HC150 H 379', category: 'Utility', branch: 'MMN' }
            , { code: 'APMSA00CMP-07', unitName: 'Piston Compressor Shanghair', category: 'Utility', branch: 'MMN' }
            , { code: 'MSNNJK0045', unitName: 'CHL-52 CHILLER', category: 'Utility', branch: 'MMN' }
            , { code: 'I120-LY155', unitName: 'INJ-120 INJECTION MOULDING LIEN YU (LY155SV)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0001', unitName: 'INJ-36 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0002', unitName: 'INJ-42 INJECTION MOULDING LIEN YU (LY555)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0003', unitName: 'INJ-43 INJECTION MOULDING LIEN YU (LY555)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0004', unitName: 'INJ-41 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0005', unitName: 'INJ-50 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0006', unitName: 'INJ-65 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0007', unitName: 'INJ-66 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0008', unitName: 'INJ-67 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0009', unitName: 'INJ-100 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0010', unitName: 'INJ-68 INJECTION MOULDING LIEN YU (LY155)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0012', unitName: 'INJ-119 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0013', unitName: 'INJ-129 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0014', unitName: 'INJ-130 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0015', unitName: 'INJ-109 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0016', unitName: 'INJ-110 INJECTION MOULDING LIEN YU (LY305)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0024', unitName: 'INJ-146 INJECTION MOULDING HWAMDA (HWD-308 ID026X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0025', unitName: 'INJ-147 INJECTION MOULDING HWAMDA (HWD-308 ID027X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0026', unitName: 'INJ-148 INJECTION MOULDING HWAMDA (HWD-308 ID024X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0027', unitName: 'INJ-149 INJECTION MOULDING HWAMDA (HWD-308 ID025X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0031', unitName: 'INJ-150 INJECTION MOULDING HWAMDA (HWD-308 ID044X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0032', unitName: 'INJ-151 INJECTION MOULDING HWAMDA (HWD-308 ID043X)', category: 'Injection', branch: 'MMS' }
            , { code: 'MSNSRG0034', unitName: 'INJ-159 INJECTION MOULDING HWAMDA (HWD-700 ID016Y)', category: 'Injection', branch: 'MMS' }
            , { code: 'APF2308CRN-CRN-06', unitName: 'CRANE DEMAG', category: 'Lain-lain', branch: 'MMS' }
            , { code: 'MSNSRG0011', unitName: 'PRT-16 PRINTER KAZE K8000', category: 'Printing', branch: 'MMS' }
            , { code: 'MSNSDA0314', unitName: 'RBT-31 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMS' }
            , { code: 'MSNSRG0023', unitName: 'RBT-17 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMS' }
            , { code: 'MSNSRG0028', unitName: 'RBT-19 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMS' }
            , { code: 'MSNSRG0030', unitName: 'RBT-21 ROBOT TENSO (1200SNC3P)', category: 'Robot', branch: 'MMS' }
            , { code: 'APF2507CMP-14', unitName: 'CMP-14 SCREW AIR COMPRESSOR INGERSOL 55 KW', category: 'Utility', branch: 'MMS' }
        ];