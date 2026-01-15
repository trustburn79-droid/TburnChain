#!/bin/bash
# TBURN Genesis Validators - GCP Secret Manager 저장 스크립트
# 실행 전: gcloud services enable secretmanager.googleapis.com

PROJECT_ID="your-gcp-project-id"

# TBURN-Core-001 (core)
gcloud secrets create tburn_core_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0f667b750814172876823c3e7785e7fff5dcc0ab4f71c70df3fc0cfe6ba430dd" | gcloud secrets versions add tburn_core_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-002 (core)
gcloud secrets create tburn_core_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4ec8013a93ef72538a4803b44bebfd06f568af0944c88ed09d4cc7de48cf9aed" | gcloud secrets versions add tburn_core_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-003 (core)
gcloud secrets create tburn_core_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xefe14787a9b863f4954fa6f6591379d4417c1edd29b4c573453cca88c092b0a8" | gcloud secrets versions add tburn_core_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-004 (core)
gcloud secrets create tburn_core_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x704d0e0efb1263dfa13de170c9f85582a0dc3b11f56da2314aaa74d7531474f1" | gcloud secrets versions add tburn_core_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-005 (core)
gcloud secrets create tburn_core_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x67a392e4d19cb495c04e977c8d961c4eb6e26f8a80830933d7ab91bc6e67e378" | gcloud secrets versions add tburn_core_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-006 (core)
gcloud secrets create tburn_core_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xced36e342df81e3de117970e2358db88cb82b0a8ee584aa4076ebeb7e8f348dc" | gcloud secrets versions add tburn_core_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-007 (core)
gcloud secrets create tburn_core_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x7690cc71a5e1303deea155a2ac6dfefb4659c7597c79ba8d3d0b562e5dc0f5e1" | gcloud secrets versions add tburn_core_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-008 (core)
gcloud secrets create tburn_core_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xe2088073d321667ef8a3d13010d068b552fab5cc186a56b44c9fdf2ab3a1125f" | gcloud secrets versions add tburn_core_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-009 (core)
gcloud secrets create tburn_core_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8ab234fdb31a8648953e89fc7f4809c60ad4545ff8361187ee1c029065523fe5" | gcloud secrets versions add tburn_core_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-010 (core)
gcloud secrets create tburn_core_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xcce3c00fef9c08cfd29156f0873d26e108829be390c7ffae10de1f4e175a0cd8" | gcloud secrets versions add tburn_core_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-001 (enterprise)
gcloud secrets create tburn_enterprise_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc073ed08f11c96a396a1394b38dd9f47a1cce604afc124466404fabcf45b1959" | gcloud secrets versions add tburn_enterprise_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-002 (enterprise)
gcloud secrets create tburn_enterprise_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x1412a3d290437de43aa0773382839c4d76e1f1971e71a6e11f7d3981fbaed1d9" | gcloud secrets versions add tburn_enterprise_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-003 (enterprise)
gcloud secrets create tburn_enterprise_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x653ceb2fb59dd976db5089859058f2b7b4384e726cafe9704577f536ecd17482" | gcloud secrets versions add tburn_enterprise_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-004 (enterprise)
gcloud secrets create tburn_enterprise_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc9af0a02e6a936d39e708395c4625e42d235214a8ccc867c2aa7cb4d4585365a" | gcloud secrets versions add tburn_enterprise_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-005 (enterprise)
gcloud secrets create tburn_enterprise_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd79bb732b105066e8f5958577969c09fe1159e096c2f887a6c684f6e1bdbc313" | gcloud secrets versions add tburn_enterprise_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-006 (enterprise)
gcloud secrets create tburn_enterprise_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x518ee9a299e17deb8a29fe2bf39c6134290b2ecd4511f135e85ecd3c13f8b1e0" | gcloud secrets versions add tburn_enterprise_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-007 (enterprise)
gcloud secrets create tburn_enterprise_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb5a5a4fef5eadb432ce6c3f604bd4416aefb70dafc3600553239bbd6cfb01245" | gcloud secrets versions add tburn_enterprise_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-008 (enterprise)
gcloud secrets create tburn_enterprise_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9f2b69fe970968567fc09b0b8ea41ed9c28aadea22001c82e9e56ee0a7332230" | gcloud secrets versions add tburn_enterprise_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-009 (enterprise)
gcloud secrets create tburn_enterprise_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x07563d264a32ccd134ecbb3dee82d50d9e8f12c3ad0ab939a778c62c9848414d" | gcloud secrets versions add tburn_enterprise_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-010 (enterprise)
gcloud secrets create tburn_enterprise_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x38bc25abc8df939596657ee8e581fe849671a662faca6a00dcd544ee4d00a644" | gcloud secrets versions add tburn_enterprise_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-011 (enterprise)
gcloud secrets create tburn_enterprise_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf6e531a488d95903b56739d53577f7907be0765126cb8d6cd78be97aea08bacf" | gcloud secrets versions add tburn_enterprise_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-012 (enterprise)
gcloud secrets create tburn_enterprise_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2dc2f2b525d56755d75990294dda44d39a16509f670c7098ee135fe9e8d99322" | gcloud secrets versions add tburn_enterprise_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-013 (enterprise)
gcloud secrets create tburn_enterprise_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x16e4f70a6acc97e542084f6596734f58ad6fcbbd8454c6cca3c8f2e592340797" | gcloud secrets versions add tburn_enterprise_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-014 (enterprise)
gcloud secrets create tburn_enterprise_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x49b99481eaff09a9c7c594fc5f982446ff1aa468d02d5c534924a7b9b442303f" | gcloud secrets versions add tburn_enterprise_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-015 (enterprise)
gcloud secrets create tburn_enterprise_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0512bbadc473aced0b549e9d9e5be0c5063527133ef47a8a2aeb29b4d7d2271b" | gcloud secrets versions add tburn_enterprise_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-016 (enterprise)
gcloud secrets create tburn_enterprise_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x5e0f2b4d79d774d47d2929c9f64ba384502ea00153553da253098a595c3cd073" | gcloud secrets versions add tburn_enterprise_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-017 (enterprise)
gcloud secrets create tburn_enterprise_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb294ffe691540a12999391ea4f1b56a74863df7bc64ccd0b1a52270e63451945" | gcloud secrets versions add tburn_enterprise_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-018 (enterprise)
gcloud secrets create tburn_enterprise_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb840a7e5619a423be01dc6f3c92fc6fed147e49c1c101911ebc8c44cf6195d41" | gcloud secrets versions add tburn_enterprise_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-019 (enterprise)
gcloud secrets create tburn_enterprise_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8e9b41d74ca1a6be2552ca4572600e51f575a3f2f93c29ceb95b19af33226706" | gcloud secrets versions add tburn_enterprise_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-020 (enterprise)
gcloud secrets create tburn_enterprise_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xbb333ae4897d8a3623d168761e663cdfd9d6b905e370068820c249ac3f253ccf" | gcloud secrets versions add tburn_enterprise_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-021 (enterprise)
gcloud secrets create tburn_enterprise_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x1784811054eb71af14fd7d5115c774cf7d5025f598b6461a56a19af6e0e165b3" | gcloud secrets versions add tburn_enterprise_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-022 (enterprise)
gcloud secrets create tburn_enterprise_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x58ea3e5651ac3b465b4f023b65608e7b0431cccca8f49b81908eebd68768c394" | gcloud secrets versions add tburn_enterprise_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-023 (enterprise)
gcloud secrets create tburn_enterprise_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8cb04be072b910832a806c36b16e9f84699dca334ea168eabd5324fe2ca1b0dc" | gcloud secrets versions add tburn_enterprise_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-024 (enterprise)
gcloud secrets create tburn_enterprise_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x3ac5fbfaa18fbf799503df70b8357859e9c42b157a57fc661759f6fb6bc18a8d" | gcloud secrets versions add tburn_enterprise_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-025 (enterprise)
gcloud secrets create tburn_enterprise_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x37556d9e8174f2c273ee89f332187e46a80b3cebfbc58f73f8f488627accea54" | gcloud secrets versions add tburn_enterprise_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-001 (partner)
gcloud secrets create tburn_partner_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x62e6d561ab7122533a09006bffd533106e836c4c5ad37da77db9f63f435343e2" | gcloud secrets versions add tburn_partner_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-002 (partner)
gcloud secrets create tburn_partner_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xe42ddcd98c6353700d9e09be609f5e66f73f5014f7fcd6a7b1752ff1fa6cd6c6" | gcloud secrets versions add tburn_partner_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-003 (partner)
gcloud secrets create tburn_partner_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x58a06f6a9713fcc49ebaf7dc9f4056601b95603178ec18b5680103ad78b890df" | gcloud secrets versions add tburn_partner_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-004 (partner)
gcloud secrets create tburn_partner_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc0f63d72987c577776444f1e5fc2cf802671606b6aede37ecb0bff308bd35253" | gcloud secrets versions add tburn_partner_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-005 (partner)
gcloud secrets create tburn_partner_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8cbff2efc3169b6aa69d46fe01300692df2d26fdcca374155b0f0dabb338e09c" | gcloud secrets versions add tburn_partner_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-006 (partner)
gcloud secrets create tburn_partner_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x5636933db150cb03fdce827903785f48131141c680ea1127efba163110df7334" | gcloud secrets versions add tburn_partner_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-007 (partner)
gcloud secrets create tburn_partner_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8fc3c4b321866c37602ea9e57cb826f66e71b2d5aaa4cda48a40dc857f5d9300" | gcloud secrets versions add tburn_partner_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-008 (partner)
gcloud secrets create tburn_partner_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf726aae715f8ffb9d86053417951781a96b6b886ef0669e2d268d58086d7887c" | gcloud secrets versions add tburn_partner_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-009 (partner)
gcloud secrets create tburn_partner_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0fab9444746b1e0ae8615b7c8c70e1954728ef96ea5e215ffbbbc8f4657d4ce5" | gcloud secrets versions add tburn_partner_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-010 (partner)
gcloud secrets create tburn_partner_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4d1c7540bad2e7d56b6d30494c9d10c93551fbea04d1fe2f143b0a65d5e9b71c" | gcloud secrets versions add tburn_partner_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-011 (partner)
gcloud secrets create tburn_partner_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9e5678180d1e97a32b6733e7147a3541eda66ac0bbcf88515730534c4d5cdc4e" | gcloud secrets versions add tburn_partner_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-012 (partner)
gcloud secrets create tburn_partner_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb9d127ae6500b57538ef3994ae4e1e2f1d16b72a1fb66ad19be1ead7baea9dd2" | gcloud secrets versions add tburn_partner_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-013 (partner)
gcloud secrets create tburn_partner_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xdab629fe4cc82c56323582200c3384d0b611f737d9d433f582debab21451ad6d" | gcloud secrets versions add tburn_partner_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-014 (partner)
gcloud secrets create tburn_partner_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x90e35078e2c21d9d440f1cb77cb3802a61dc1f233edb634c7259367d69ab51c6" | gcloud secrets versions add tburn_partner_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-015 (partner)
gcloud secrets create tburn_partner_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x16105c15b048761682538df5e7541119662396a6f6f9312fbdcf21263f52cca2" | gcloud secrets versions add tburn_partner_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-016 (partner)
gcloud secrets create tburn_partner_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x075f033b4a576b057e24e067a33379402a0f283753135ca08b3ab5826d1ec341" | gcloud secrets versions add tburn_partner_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-017 (partner)
gcloud secrets create tburn_partner_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x7b2267bf2039f5737495e58b302ad6f03549a3f2ff51ef08739b3c67ccee0799" | gcloud secrets versions add tburn_partner_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-018 (partner)
gcloud secrets create tburn_partner_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x168b04dc56eb68fd62646e45c03e441076dc7c825d277ff53946b16ab6900c17" | gcloud secrets versions add tburn_partner_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-019 (partner)
gcloud secrets create tburn_partner_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x95f8db2c156970ab2389aec9ae92f6cc540911e51f2cf4433c49168fbe197517" | gcloud secrets versions add tburn_partner_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-020 (partner)
gcloud secrets create tburn_partner_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x830bcf6441bc1e7535fcafa267adaadf0cc66453b43c696f3da768a3c632ff0d" | gcloud secrets versions add tburn_partner_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-021 (partner)
gcloud secrets create tburn_partner_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xe3cb87be0e97d54850f02e7e10426f070b7834aa1c8e47016b04adb79a80e479" | gcloud secrets versions add tburn_partner_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-022 (partner)
gcloud secrets create tburn_partner_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6cded9700b1d59ea60b9a4bd1fbf6b3a329bbd843750caf0fd45510b47e97cd8" | gcloud secrets versions add tburn_partner_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-023 (partner)
gcloud secrets create tburn_partner_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x98245c536b7afe11d58ca4f401665f0b738a6eb869d8e9b542f17e505d63284c" | gcloud secrets versions add tburn_partner_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-024 (partner)
gcloud secrets create tburn_partner_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8dd3608227a71c6bf4c145ef8a10c704d122ebb7907632a43a607270344472b2" | gcloud secrets versions add tburn_partner_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-025 (partner)
gcloud secrets create tburn_partner_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6dbd890ca00f81d5df478fb4e0af07e0b2ff9c29fa06788f068d927c14f3a549" | gcloud secrets versions add tburn_partner_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-026 (partner)
gcloud secrets create tburn_partner_026_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xe085c86da00d85203950299881ba2a2eafe761fce4075e4ff9c5609dd427df98" | gcloud secrets versions add tburn_partner_026_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-027 (partner)
gcloud secrets create tburn_partner_027_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xfa57967a3a59ed98d3f52354e3467eabeda47098a1b5ef62dff290c43aa7be30" | gcloud secrets versions add tburn_partner_027_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-028 (partner)
gcloud secrets create tburn_partner_028_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xee918127d516a9cbd6943689aecb8339f2ba9ca884e74693ab2de24dbcf03691" | gcloud secrets versions add tburn_partner_028_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-029 (partner)
gcloud secrets create tburn_partner_029_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x390c8c3f931b0562d2c25e0ffd045bd4d982cbe67f038cc1d250a1b859b233ce" | gcloud secrets versions add tburn_partner_029_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-030 (partner)
gcloud secrets create tburn_partner_030_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x966dc418cb9e225bf8888a796015b96ccf78f55b27691f35c6f55a19787e1a28" | gcloud secrets versions add tburn_partner_030_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-031 (partner)
gcloud secrets create tburn_partner_031_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4d67f7f9fbafaaf4bf95a2a15e864fdcdc80b26311f046c3fe7da1511e76a191" | gcloud secrets versions add tburn_partner_031_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-032 (partner)
gcloud secrets create tburn_partner_032_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0497a37bd1044d6dcaaf87bb77da6a22f730f0941679355103129480f5b2fa7d" | gcloud secrets versions add tburn_partner_032_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-033 (partner)
gcloud secrets create tburn_partner_033_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9b05ec76485fe3e3f737e956e12d05df1118fcb4cbdee98307a1f50168839662" | gcloud secrets versions add tburn_partner_033_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-034 (partner)
gcloud secrets create tburn_partner_034_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xba4b6905818a74cde5b674be7c8e10532fb3e39abcb93583007d2fdf6625c7bc" | gcloud secrets versions add tburn_partner_034_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-035 (partner)
gcloud secrets create tburn_partner_035_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc13a9a530966a2264de3360ff514a2a8d50a21e548dc0a17423eb2bb1c1ba07d" | gcloud secrets versions add tburn_partner_035_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-036 (partner)
gcloud secrets create tburn_partner_036_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x25a01321540813638f6e6d687a1119807395c28048f1f8f0dfe9e3073883786a" | gcloud secrets versions add tburn_partner_036_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-037 (partner)
gcloud secrets create tburn_partner_037_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6eb201a149a33460554ea37197664ebf3f77f1880bf234cf6d8a03c585da1a2a" | gcloud secrets versions add tburn_partner_037_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-038 (partner)
gcloud secrets create tburn_partner_038_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xfd227bed218963421cafa6897155995c163458fece4d0fd00593af2a7cc000f3" | gcloud secrets versions add tburn_partner_038_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-039 (partner)
gcloud secrets create tburn_partner_039_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0a96792fd769e2a7b7c9da7608dd552e47c570a88ef48c88aaf5d2b4b2bf0df5" | gcloud secrets versions add tburn_partner_039_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-040 (partner)
gcloud secrets create tburn_partner_040_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb9924dacffe523d6c0e864701be07e6d96e2af9a0c27f81a120058d6412847a0" | gcloud secrets versions add tburn_partner_040_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-001 (community)
gcloud secrets create tburn_genesis_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x63bb4c3c03f331d44b47e8804c9c808b312f40c8d0c2f906d33fd694ca11f60f" | gcloud secrets versions add tburn_genesis_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-002 (community)
gcloud secrets create tburn_genesis_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xcb1cae994cd11d97e4e278c01f409d36e73a537877b7d8bcbd06daa2878f9ef4" | gcloud secrets versions add tburn_genesis_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-003 (community)
gcloud secrets create tburn_genesis_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x466da2a24f54983bde1c7f0969db1acc1eac86a764a6591224cecc439118d662" | gcloud secrets versions add tburn_genesis_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-004 (community)
gcloud secrets create tburn_genesis_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa815cc7c14c03b9d9e7849d003d5d6e17419329d9501c0ead8d550b540dee182" | gcloud secrets versions add tburn_genesis_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-005 (community)
gcloud secrets create tburn_genesis_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6690577d37d0550a94277dd0d7901cba7ecdf78a3ba6c163ee18cd0a8c06055e" | gcloud secrets versions add tburn_genesis_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-006 (community)
gcloud secrets create tburn_genesis_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa61f452e0b80484b0b461965477a353d4e518913a83be77d262b2d534c907e3b" | gcloud secrets versions add tburn_genesis_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-007 (community)
gcloud secrets create tburn_genesis_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa5246ccadf12c61b1f08fb310d62c358c94f02916d1f9d8d80a82c3190f35a4b" | gcloud secrets versions add tburn_genesis_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-008 (community)
gcloud secrets create tburn_genesis_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xde61b8fb1edc32634f4d056f1e94b682168ca5a44f301de0bd606e9492f737d9" | gcloud secrets versions add tburn_genesis_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-009 (community)
gcloud secrets create tburn_genesis_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x66d6e94d7ec2c902cc9c5af66b35524bdef48569754bc69764e160766dbea147" | gcloud secrets versions add tburn_genesis_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-010 (community)
gcloud secrets create tburn_genesis_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x33d5a3a609636a6f6748e99cfeff6fdf9c2cb20c4f2b543435ca489fd91579dc" | gcloud secrets versions add tburn_genesis_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-011 (community)
gcloud secrets create tburn_genesis_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2d1d12f146abdd9b8addbe35797b04016399865920ecf20e15180b7c94ec8c91" | gcloud secrets versions add tburn_genesis_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-012 (community)
gcloud secrets create tburn_genesis_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x767915dcf3b07269afadfc94cb3ba022e595d9a546137a9344d9a3b007382ea8" | gcloud secrets versions add tburn_genesis_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-013 (community)
gcloud secrets create tburn_genesis_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8b4774982d907468286c368bd1c5c67afc8e016d9f3d55fa4a6d81ba06bf68d8" | gcloud secrets versions add tburn_genesis_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-014 (community)
gcloud secrets create tburn_genesis_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9b5c90874bff34a3da01ffeb845704f255d0c42a306185ad5ab6ae4573ace99a" | gcloud secrets versions add tburn_genesis_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-015 (community)
gcloud secrets create tburn_genesis_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x80814bee86544e4b8ba845dfe27c6f0e2762fd94fca1663d8c5e0d9c94f8f7ff" | gcloud secrets versions add tburn_genesis_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-016 (community)
gcloud secrets create tburn_genesis_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xdb0124ed9bd123517b06084f9f88e902b10557bb79b5e3e2ab4db87e4396607a" | gcloud secrets versions add tburn_genesis_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-017 (community)
gcloud secrets create tburn_genesis_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x130b9b0917eb11ea77267b6f3a836dbb99ec8e89aa81428821093698be8336db" | gcloud secrets versions add tburn_genesis_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-018 (community)
gcloud secrets create tburn_genesis_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd067e6ee1677981e88ba37a55a7b78f621c800e37c3acb031fbcccb4a0772e1a" | gcloud secrets versions add tburn_genesis_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-019 (community)
gcloud secrets create tburn_genesis_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x1d187c5c2de56079cd958f5e6bbdcf7145a321df1966e52c92def0b88caccdd3" | gcloud secrets versions add tburn_genesis_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-020 (community)
gcloud secrets create tburn_genesis_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa5536659429e093a9b79d5c3c7ee6797672b731f491b8fbc411be1bc18073d74" | gcloud secrets versions add tburn_genesis_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-021 (community)
gcloud secrets create tburn_genesis_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x3b668aefaa2990e2fba41a6d9eea6c8271a88d74ffdb5e57b3d0ae5e0a20bc31" | gcloud secrets versions add tburn_genesis_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-022 (community)
gcloud secrets create tburn_genesis_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc936598664a526833b8a564679e9d0e2afde7f1e78856cb8d756356c38d81264" | gcloud secrets versions add tburn_genesis_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-023 (community)
gcloud secrets create tburn_genesis_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa4bcf8ff0fb052873821f22022b39de0327360c4a0fe247ecbd7b209bd3bf453" | gcloud secrets versions add tburn_genesis_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-024 (community)
gcloud secrets create tburn_genesis_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6a77ed8a15815467a9d7a2153ecc5f1e2bc4377dab6718a82ddf5f2486b718ad" | gcloud secrets versions add tburn_genesis_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-025 (community)
gcloud secrets create tburn_genesis_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x506d07de4c1995049655485fbedf3faacb89d33d142253e6cc78b8bf5351c424" | gcloud secrets versions add tburn_genesis_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-026 (community)
gcloud secrets create tburn_genesis_026_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x444d9cef3a08947d3ec492fcd584df8efdfe922f432052477557e91aa5a337c8" | gcloud secrets versions add tburn_genesis_026_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-027 (community)
gcloud secrets create tburn_genesis_027_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4f59e44e2b18367d20f7a769511dc7c69169c7e065e2182d79e3ba34af876795" | gcloud secrets versions add tburn_genesis_027_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-028 (community)
gcloud secrets create tburn_genesis_028_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x30d63112201c3eb6e8c2cd5c0aad817d7fa126f4df3843443aa3b0e16e77ada7" | gcloud secrets versions add tburn_genesis_028_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-029 (community)
gcloud secrets create tburn_genesis_029_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa4c6b3c5cf769ae0b28526b56f9d7231822a2666ad0908c8fc6d3870faf77769" | gcloud secrets versions add tburn_genesis_029_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-030 (community)
gcloud secrets create tburn_genesis_030_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa5081eeb49b62942ad86fc323ffdb9c123b03f89073fc2bfd999024092b77ba4" | gcloud secrets versions add tburn_genesis_030_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-031 (community)
gcloud secrets create tburn_genesis_031_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xca526fc6147981a8e47ed02014443e40a54b52d87d48c1750f64045cbf910562" | gcloud secrets versions add tburn_genesis_031_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-032 (community)
gcloud secrets create tburn_genesis_032_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9a3964a4f04724d9fe2a99030c0761d38ddf65b11babbbe90517120075fe7452" | gcloud secrets versions add tburn_genesis_032_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-033 (community)
gcloud secrets create tburn_genesis_033_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf36e1ab8df6279d739fd05583e63cfd00ce3c04a4969d28b8f35fdef61d234ab" | gcloud secrets versions add tburn_genesis_033_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-034 (community)
gcloud secrets create tburn_genesis_034_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x38de3f114204cb1cf30ed060b299e5fb8878311f1b9213efe2dc90d263fff557" | gcloud secrets versions add tburn_genesis_034_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-035 (community)
gcloud secrets create tburn_genesis_035_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x49bd3b2bfcb7729191cc3fb0773b6f7693276cff18faeba408fb0716bc19c2d3" | gcloud secrets versions add tburn_genesis_035_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-036 (community)
gcloud secrets create tburn_genesis_036_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd1a013d380b48a0c7d876527fc0ebd2c3aba1c1d587b4959fd1a16da3471f6e3" | gcloud secrets versions add tburn_genesis_036_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-037 (community)
gcloud secrets create tburn_genesis_037_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8cbae9eeff80e04353a6e42323d3ef38d88c672c2f9f5c8402c4d016a6ada3bd" | gcloud secrets versions add tburn_genesis_037_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-038 (community)
gcloud secrets create tburn_genesis_038_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa18787b7e1ece9a345b85de8ddf8c39fed775e848e3eed8f177dfdec324f6d81" | gcloud secrets versions add tburn_genesis_038_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-039 (community)
gcloud secrets create tburn_genesis_039_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc04253fdf85a6e93590aca54bffbb1f83910685f57f049d151b4a976dbfec212" | gcloud secrets versions add tburn_genesis_039_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-040 (community)
gcloud secrets create tburn_genesis_040_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x566e8534691588690101d6fe10bb2ee62165ad8e18d22cc422ba59206ddf264e" | gcloud secrets versions add tburn_genesis_040_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-041 (community)
gcloud secrets create tburn_genesis_041_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xcfa0b26e5e4e09b56eac9d9d3ebb267c1bfb8697dbb6d6d379022aa281b05660" | gcloud secrets versions add tburn_genesis_041_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-042 (community)
gcloud secrets create tburn_genesis_042_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb70561b52588b09a8a1584d1e9c9a3f382c70d1fda9660b7a96f13d33d4889a4" | gcloud secrets versions add tburn_genesis_042_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-043 (community)
gcloud secrets create tburn_genesis_043_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4447be84072baef5d71f53e1c16ccc8f414702e5584920ec03203b3a24fc2343" | gcloud secrets versions add tburn_genesis_043_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-044 (community)
gcloud secrets create tburn_genesis_044_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2084f7f942d7981dfc7347168cc534ac27a196f3d136fd93cd33ab2ada9540e6" | gcloud secrets versions add tburn_genesis_044_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-045 (community)
gcloud secrets create tburn_genesis_045_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa46b8a07c2f199ea6cfc88846db21868421d2afc5ddbc407962d58e6aa52e0e5" | gcloud secrets versions add tburn_genesis_045_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-046 (community)
gcloud secrets create tburn_genesis_046_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0ed42c97b71a23bde699a279fc20dee1834b1067569cb574cc23e8a53a531f49" | gcloud secrets versions add tburn_genesis_046_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-047 (community)
gcloud secrets create tburn_genesis_047_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x772e66aa5e99aded865f1b1fd2cb2093f1eaee5648bc7565eb38f36abf4cfe0e" | gcloud secrets versions add tburn_genesis_047_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-048 (community)
gcloud secrets create tburn_genesis_048_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb702c2b138f409c50b8f315e8957ac2f578d75f8934728d2e0ac38b360e5d4fa" | gcloud secrets versions add tburn_genesis_048_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-049 (community)
gcloud secrets create tburn_genesis_049_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa5802bf4808276a41c64f6e2186b23f3ccb09f8ec5da9b72ec06af960545528d" | gcloud secrets versions add tburn_genesis_049_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-050 (community)
gcloud secrets create tburn_genesis_050_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x57ed1cee5090962870ec395cdcb4be73728c6ed9b5a5e114900caf9a19263a23" | gcloud secrets versions add tburn_genesis_050_key --project=$PROJECT_ID --data-file=-

