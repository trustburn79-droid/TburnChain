#!/bin/bash
# TBURN Genesis Validators - GCP Secret Manager 저장 스크립트
# 실행 전: gcloud services enable secretmanager.googleapis.com

PROJECT_ID="your-gcp-project-id"

# TBURN-Core-001 (core)
gcloud secrets create tburn_core_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x08970dd870bedfbdf075103aa22d19ff3f66c4c50ec416d4cfeb09dc2974ffd8" | gcloud secrets versions add tburn_core_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-002 (core)
gcloud secrets create tburn_core_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x422392c93507279d590f313998e54c6434e2a37bf1bb4ae0df238570671e8b44" | gcloud secrets versions add tburn_core_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-003 (core)
gcloud secrets create tburn_core_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x61ef62e1b482e57469567d32561c31024d70bdbf71f11fa00b00612717315b6c" | gcloud secrets versions add tburn_core_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-004 (core)
gcloud secrets create tburn_core_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf2280655b595d39c18bb3055965c031b04bb99461109ed4cc1b8e09beb7438fe" | gcloud secrets versions add tburn_core_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-005 (core)
gcloud secrets create tburn_core_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf9b785ea43e94606867f7ca5d477d95ef1fec288eb5b8fa252730258ceccf1df" | gcloud secrets versions add tburn_core_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-006 (core)
gcloud secrets create tburn_core_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4691da6e0612a9ccc12e92bc90be9ebb2d45048301a50c3c2119ea848ccd5506" | gcloud secrets versions add tburn_core_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-007 (core)
gcloud secrets create tburn_core_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x001fdbd6141eb59c18ac8c0973f5b1f262870641e4ed692390c15b1bea8fd1e2" | gcloud secrets versions add tburn_core_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-008 (core)
gcloud secrets create tburn_core_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0cae3b1f8edd4330cf5205b430124f81bfa864936ff033db7d427b8561f786b3" | gcloud secrets versions add tburn_core_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-009 (core)
gcloud secrets create tburn_core_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x05f0af40362b99c5ec05d3cd95706c7032b7194961e757e3ae09cab7fc851a4c" | gcloud secrets versions add tburn_core_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Core-010 (core)
gcloud secrets create tburn_core_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0cbeaa2a8f8ce2f4c460ce7909561f547a5c01d9220c5f58d4d07948a5d55a91" | gcloud secrets versions add tburn_core_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-001 (enterprise)
gcloud secrets create tburn_enterprise_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0283a99f8775bd0d2ca17efcc276004313eda28e18bc905197bf0b800530b134" | gcloud secrets versions add tburn_enterprise_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-002 (enterprise)
gcloud secrets create tburn_enterprise_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x3a5c75140d354103717153c8c1b3df2e27187e19d9cd4b6f1b50519ddc162900" | gcloud secrets versions add tburn_enterprise_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-003 (enterprise)
gcloud secrets create tburn_enterprise_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf90af2bdc8bdc332e4854ca18bcf1a1faeb4b1d05ff0ed5c71fea2457cac3f87" | gcloud secrets versions add tburn_enterprise_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-004 (enterprise)
gcloud secrets create tburn_enterprise_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x06a7a9682211b88a68490aa235f2b5dc5e8b503dabd52f460c107de8aa0a7869" | gcloud secrets versions add tburn_enterprise_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-005 (enterprise)
gcloud secrets create tburn_enterprise_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x735a5c283770c58d7ac486f63dc504a7fd3017218456d48325bedfe68add3407" | gcloud secrets versions add tburn_enterprise_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-006 (enterprise)
gcloud secrets create tburn_enterprise_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x7be682c59802e5e7bd974bdeadaa4b38856bed5d239765b7ddd4a3080758cedd" | gcloud secrets versions add tburn_enterprise_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-007 (enterprise)
gcloud secrets create tburn_enterprise_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xcebe12ccd72f8c08792960cbe5109b5c61d7973cde0826d93a061cdab4f82648" | gcloud secrets versions add tburn_enterprise_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-008 (enterprise)
gcloud secrets create tburn_enterprise_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8f7e8a9ae5ba37c3c2551c8d1136d621b49767ef489e3eabacb6898f8dd52a6d" | gcloud secrets versions add tburn_enterprise_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-009 (enterprise)
gcloud secrets create tburn_enterprise_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa3c74f1e5a5e3e7aecb06e0d9f6d0ecf8ec397e0102db1a185835bf4e5e0d4da" | gcloud secrets versions add tburn_enterprise_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-010 (enterprise)
gcloud secrets create tburn_enterprise_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4f5e14cbd302d375106aeebabeab831260c76a8966d7f61bed6ed5c76e5d0027" | gcloud secrets versions add tburn_enterprise_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-011 (enterprise)
gcloud secrets create tburn_enterprise_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xab5927a24cd06b38e6fbde26a102e2383234e396f4d610622dc97f01eba03daa" | gcloud secrets versions add tburn_enterprise_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-012 (enterprise)
gcloud secrets create tburn_enterprise_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa63b60bbc68f13cec36f5d3a59781b57fd38b5df0fd4f8fffe8fce6f393e29e8" | gcloud secrets versions add tburn_enterprise_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-013 (enterprise)
gcloud secrets create tburn_enterprise_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4c727d08a75f16f8a68cd7e90484688c23255649871c4560e9c0c0a162c20529" | gcloud secrets versions add tburn_enterprise_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-014 (enterprise)
gcloud secrets create tburn_enterprise_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xecbe2971fa6ecd23e6cc40993d9ed91d10191c9ba06341a71fafb7371e82b654" | gcloud secrets versions add tburn_enterprise_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-015 (enterprise)
gcloud secrets create tburn_enterprise_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x194d42474f9649383b95e8e4e4f45c1d4114130071cb57b8de478efc1e37f240" | gcloud secrets versions add tburn_enterprise_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-016 (enterprise)
gcloud secrets create tburn_enterprise_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x59491dd5e097b33904a657a3c206aae1701572e33838ad8cce88931096ffeca9" | gcloud secrets versions add tburn_enterprise_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-017 (enterprise)
gcloud secrets create tburn_enterprise_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd2e1dd2d2c2b906b5cf19460c9de39cd30e2ebde5b22f5b1cb07cbf472585fb9" | gcloud secrets versions add tburn_enterprise_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-018 (enterprise)
gcloud secrets create tburn_enterprise_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x49460d07df930c8b0a59643ae4dd8f3d1a5a74138b85025eaa4d34f37e1fdf7e" | gcloud secrets versions add tburn_enterprise_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-019 (enterprise)
gcloud secrets create tburn_enterprise_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2e19b03a65d6936275620489143227ee6f5a140f278776315c25130cc54451f3" | gcloud secrets versions add tburn_enterprise_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-020 (enterprise)
gcloud secrets create tburn_enterprise_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x249b8ea315bc8dc0210c5196003f83d7c91f88c4c7539389ab0f66448525a476" | gcloud secrets versions add tburn_enterprise_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-021 (enterprise)
gcloud secrets create tburn_enterprise_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc466ebf4d96375c405b3a370e8ac9b40fe8487af443b3f9e29482f129883db86" | gcloud secrets versions add tburn_enterprise_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-022 (enterprise)
gcloud secrets create tburn_enterprise_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf33dc08ba1daf4923015a3b6ea99476b075e2d634bacc421e32927303f0ce767" | gcloud secrets versions add tburn_enterprise_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-023 (enterprise)
gcloud secrets create tburn_enterprise_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6bb5f43455c806ff3f7b7be981664dae1fa92e2dadbbd5e9f8360e671a37d364" | gcloud secrets versions add tburn_enterprise_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-024 (enterprise)
gcloud secrets create tburn_enterprise_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8b685f8aa7443db2b535eedbdee3c3e6cbb7f4eb60e9afce7c0f25e1774376eb" | gcloud secrets versions add tburn_enterprise_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Enterprise-025 (enterprise)
gcloud secrets create tburn_enterprise_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x59e0e274fab517fc30e50489595611670f6a86542d4bbb957b16c291b10f3ed3" | gcloud secrets versions add tburn_enterprise_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-001 (partner)
gcloud secrets create tburn_partner_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x5ed9be8039ace49d137eb2f65e81cd5a01f709aaed3cf35f8328237b11a4a70d" | gcloud secrets versions add tburn_partner_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-002 (partner)
gcloud secrets create tburn_partner_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xdff58ec3c2b69911f994d30a53e8eeceb39e621cd70c4ce9a6226546619b5dd3" | gcloud secrets versions add tburn_partner_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-003 (partner)
gcloud secrets create tburn_partner_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa477ad7b4ab14d3df8de7825637c0fe2c4e19c3e0d7f9321eaf0353b0a63f015" | gcloud secrets versions add tburn_partner_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-004 (partner)
gcloud secrets create tburn_partner_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa590573df61d74ae14cf7049943d037ba11b062830a8cbf6527e5aa88c30a49a" | gcloud secrets versions add tburn_partner_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-005 (partner)
gcloud secrets create tburn_partner_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6f5edaef32eab5054bcd3b95f21416f2ac7c6498dbfaeab2cd4a41db96167386" | gcloud secrets versions add tburn_partner_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-006 (partner)
gcloud secrets create tburn_partner_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x582c17687fee965d9a21b26173f1f539c4bd949ea5db00459e8633e66caed700" | gcloud secrets versions add tburn_partner_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-007 (partner)
gcloud secrets create tburn_partner_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xdae6ab0b77dbf61bfa794c803ecf70d6e9f7be8804180eb96eaf6d8079c8b1f3" | gcloud secrets versions add tburn_partner_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-008 (partner)
gcloud secrets create tburn_partner_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xfa85d3c7dcdd7c4d738e239700a549a5d7984990874e39f06a7973cf9b98d904" | gcloud secrets versions add tburn_partner_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-009 (partner)
gcloud secrets create tburn_partner_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x95e46acf2254154f8b78c78aedbb97a2a6f50c7c1d716861cfa3ac2bdaffc4d1" | gcloud secrets versions add tburn_partner_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-010 (partner)
gcloud secrets create tburn_partner_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4c05f59d9916fd976056f7686633b855e2cad71fc9fb96fe6235cd13ab61e379" | gcloud secrets versions add tburn_partner_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-011 (partner)
gcloud secrets create tburn_partner_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x653e150dfc972dc9b0d3527245e5fe83a2f35a48e977730ab6f081ccf47f470c" | gcloud secrets versions add tburn_partner_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-012 (partner)
gcloud secrets create tburn_partner_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4b85bf1ec87a1c88a46ffbf2c1aea72e42dd78122d9dadc05e26d5fbb9f9b22e" | gcloud secrets versions add tburn_partner_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-013 (partner)
gcloud secrets create tburn_partner_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x43d101691fee565f0b496e974c28d80ab7e1ea1190152175009d448c307100b7" | gcloud secrets versions add tburn_partner_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-014 (partner)
gcloud secrets create tburn_partner_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x60e71a8e09ecc9b817eaa6e783ebc41480cd43fde3ce12c86bba46de42d80137" | gcloud secrets versions add tburn_partner_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-015 (partner)
gcloud secrets create tburn_partner_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x92b3f2fbcf348f3231ef22dd5d3426675cadacfe8077e909b7bf979b2a51a915" | gcloud secrets versions add tburn_partner_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-016 (partner)
gcloud secrets create tburn_partner_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x536f62bac7f5343b1525412f0096778ad546c3ad45ab5b514d8d9bb5afb795f8" | gcloud secrets versions add tburn_partner_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-017 (partner)
gcloud secrets create tburn_partner_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x3d586b8fb9a44ccd0cdf2dfddf9e9dae20f1c62bdefc1d4ebf027bbcd8ff6c0b" | gcloud secrets versions add tburn_partner_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-018 (partner)
gcloud secrets create tburn_partner_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8302c40366a4f741b48bc096c614064040725a08d7ff1389a2aa56e0be4c461b" | gcloud secrets versions add tburn_partner_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-019 (partner)
gcloud secrets create tburn_partner_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8b9936b20d7938806e23f6c3d5df3702e5a2c9d074f98cc27887f487d6c5bcd6" | gcloud secrets versions add tburn_partner_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-020 (partner)
gcloud secrets create tburn_partner_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc1c3197448a1da6d0fb1c2c39ff522df46e9380ad9c087224d72cf2dde1f86fc" | gcloud secrets versions add tburn_partner_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-021 (partner)
gcloud secrets create tburn_partner_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x24f1853ff94d189a9cdbf3a23187efb940cacb57602f34e24c8e62db1132aed5" | gcloud secrets versions add tburn_partner_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-022 (partner)
gcloud secrets create tburn_partner_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf030eb8cb8ab1299dc0a5127f394c8d09801578b85663e7d76d6b61cd2b43f34" | gcloud secrets versions add tburn_partner_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-023 (partner)
gcloud secrets create tburn_partner_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd7d2ffc00187edec7b35acf3e434ade12abd73d992e84be7fb7fff3e6219cc8f" | gcloud secrets versions add tburn_partner_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-024 (partner)
gcloud secrets create tburn_partner_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4433f39b1c3b603d253999639bbc20ad03e128ca215b3fa4d98249ef784ada59" | gcloud secrets versions add tburn_partner_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-025 (partner)
gcloud secrets create tburn_partner_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4076e0706f0098fb1028d34dc4932c4dcbb86b4d2bc2aa0130a6f23985a84869" | gcloud secrets versions add tburn_partner_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-026 (partner)
gcloud secrets create tburn_partner_026_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x8f5bedff5da4cf803dcc872e32b208e6bafd1f47f33257710ad8ef476cd16e99" | gcloud secrets versions add tburn_partner_026_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-027 (partner)
gcloud secrets create tburn_partner_027_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xadf347e32f3809a39c729285be5f71cfc254a6111505c511d70fcf20b419cacb" | gcloud secrets versions add tburn_partner_027_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-028 (partner)
gcloud secrets create tburn_partner_028_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xe8b2bb3e702f576dcff249f2f46da65ac6891d62d445a7ed46cf7203e843e837" | gcloud secrets versions add tburn_partner_028_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-029 (partner)
gcloud secrets create tburn_partner_029_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc34a929b26dae5ffd3ad4319c2a0ae2c6ba18bcf0cb7b3186ad3f0e92dee8912" | gcloud secrets versions add tburn_partner_029_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-030 (partner)
gcloud secrets create tburn_partner_030_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x61aed286ab388dc20d12b7ef505842b9667df3ef556ae5ca0b1a767a9dc5a33b" | gcloud secrets versions add tburn_partner_030_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-031 (partner)
gcloud secrets create tburn_partner_031_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x573222ec545fd60cd40660532966f27b81a94707c155aa062768087bf944a124" | gcloud secrets versions add tburn_partner_031_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-032 (partner)
gcloud secrets create tburn_partner_032_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9ee747b5f5be864dbd81c03d25a4dafb49b449eece1700fe3ef12574b3db15c1" | gcloud secrets versions add tburn_partner_032_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-033 (partner)
gcloud secrets create tburn_partner_033_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2ce50c57140461a591b4fadefd2f287b78c56ff6e3f9b0c379cdfc56e535413c" | gcloud secrets versions add tburn_partner_033_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-034 (partner)
gcloud secrets create tburn_partner_034_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0d5b80881a24b1d8fe12ef51afd7ff7a435d35f9b977c6ec6a98477885654b12" | gcloud secrets versions add tburn_partner_034_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-035 (partner)
gcloud secrets create tburn_partner_035_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa63e9b1ca7c7a548b59f1f4c18f17eb34fa5c71ec4a1a7a8bdf4bbb1ef654b0a" | gcloud secrets versions add tburn_partner_035_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-036 (partner)
gcloud secrets create tburn_partner_036_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x25d2cd9744637f01617e8e241d2788c78b6ce7f65ec76524a8497b2d110c2218" | gcloud secrets versions add tburn_partner_036_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-037 (partner)
gcloud secrets create tburn_partner_037_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0d1664cdb4251f531aae964dd08358849052e98ce0578089fcc78e13b39c6343" | gcloud secrets versions add tburn_partner_037_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-038 (partner)
gcloud secrets create tburn_partner_038_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd30dce623a92341cb50840d8571fd97885ca269cd45d73a4f568a459750f5e98" | gcloud secrets versions add tburn_partner_038_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-039 (partner)
gcloud secrets create tburn_partner_039_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb2be1072743eb8529649e74f8c718a17fe10a40a0a7f43dc9cc9fb14a9ae7386" | gcloud secrets versions add tburn_partner_039_key --project=$PROJECT_ID --data-file=-

# TBURN-Partner-040 (partner)
gcloud secrets create tburn_partner_040_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd2a97d612d89f0c67dc65feba36974926c4ace3a686e25d68b159af314f8260a" | gcloud secrets versions add tburn_partner_040_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-001 (community)
gcloud secrets create tburn_genesis_001_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x2a0d7468fe4bf49502f89b5db58f7a55e548203d4d466e7a7f8cc404699016b4" | gcloud secrets versions add tburn_genesis_001_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-002 (community)
gcloud secrets create tburn_genesis_002_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xbf01cd8bb7531e3a1b5513ac182e706f82e6391a56b9e5ec6778ee013a45ec68" | gcloud secrets versions add tburn_genesis_002_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-003 (community)
gcloud secrets create tburn_genesis_003_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc4d9aebb3bfa3f606a539901e6bde0fcce91b49f37f6cca7c684ba67b6711640" | gcloud secrets versions add tburn_genesis_003_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-004 (community)
gcloud secrets create tburn_genesis_004_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc47ea9a719cdef58607542a0293dba3f26a82555e62723de9f8f8a35fa888c88" | gcloud secrets versions add tburn_genesis_004_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-005 (community)
gcloud secrets create tburn_genesis_005_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x89e5ee401af8bb4f7424bf2470c9ac39de0e01e6ec1c59a211bd554b39acaee3" | gcloud secrets versions add tburn_genesis_005_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-006 (community)
gcloud secrets create tburn_genesis_006_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc8790c8cbba89d6c1366a736db027af12c8083157e453e83ea8bd37b251afce8" | gcloud secrets versions add tburn_genesis_006_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-007 (community)
gcloud secrets create tburn_genesis_007_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6dd844dc81ab905bda3a9ae6787807f72ea1ec7c2dc9d5fd917f692f732fef1a" | gcloud secrets versions add tburn_genesis_007_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-008 (community)
gcloud secrets create tburn_genesis_008_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9314fa6569fc06c2c545b60b3205c29bd7d3375b5f9e1f3efca4a510c0bc0c4b" | gcloud secrets versions add tburn_genesis_008_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-009 (community)
gcloud secrets create tburn_genesis_009_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x96a2bc8937b4ba7f7c6d6d0c1fdebdc34ad8181b1714cec51d7666bc05d3660b" | gcloud secrets versions add tburn_genesis_009_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-010 (community)
gcloud secrets create tburn_genesis_010_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6f20a79b9413323f0dd174aa4db9a9d4c2accf6c55343a57206e45b5dd97dd72" | gcloud secrets versions add tburn_genesis_010_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-011 (community)
gcloud secrets create tburn_genesis_011_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x02c7343be4ae1b25310dd6c9dc6c33fdef21d0e02ac98776dce639ab7f84fb08" | gcloud secrets versions add tburn_genesis_011_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-012 (community)
gcloud secrets create tburn_genesis_012_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6e904dbcef2fd563078e854a848c6d78c5ad5dedb7fbc9af14e63f4384ef0583" | gcloud secrets versions add tburn_genesis_012_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-013 (community)
gcloud secrets create tburn_genesis_013_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6dc7933c40d03f77e8e67bed1779886ced13dfe01fa2a526c91872f20a74d474" | gcloud secrets versions add tburn_genesis_013_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-014 (community)
gcloud secrets create tburn_genesis_014_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6040a3203a80608d0157cb08356c13f84bcd283328fc375a9e01a87e8c63fc37" | gcloud secrets versions add tburn_genesis_014_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-015 (community)
gcloud secrets create tburn_genesis_015_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc1c390ae60aa6ef0c3c3394481dcb07704aecb4542e7e4fcb8e09edf218a8629" | gcloud secrets versions add tburn_genesis_015_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-016 (community)
gcloud secrets create tburn_genesis_016_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x98180d4e0d0b1f06a77655af3942ff6aad67df5b5c77c63e520da4cf781c7e3f" | gcloud secrets versions add tburn_genesis_016_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-017 (community)
gcloud secrets create tburn_genesis_017_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6ec133f1ebea2dfd90887272317f7dc179d7628d79d788aad726b5d85a18ed22" | gcloud secrets versions add tburn_genesis_017_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-018 (community)
gcloud secrets create tburn_genesis_018_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf635c18e1532964cfc2cbd6790ffc3f87c4182d366ac973f45dc707b31d9aa51" | gcloud secrets versions add tburn_genesis_018_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-019 (community)
gcloud secrets create tburn_genesis_019_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6fd26340340592eac1d02bb92f9701c1e7c767862bb6009921383d254fb9c7ee" | gcloud secrets versions add tburn_genesis_019_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-020 (community)
gcloud secrets create tburn_genesis_020_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x069250a9a3da799a4b57a163646714b4fa1643e0a34f026d700f93f30ca5a878" | gcloud secrets versions add tburn_genesis_020_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-021 (community)
gcloud secrets create tburn_genesis_021_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0daf75916710fb82134112171aa91a2588b0224129ce9156c6b648accd4bdc58" | gcloud secrets versions add tburn_genesis_021_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-022 (community)
gcloud secrets create tburn_genesis_022_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xb55a372eeb8d973dda9878f9c6bcc45d2671f269beb46eb59106eee730e18f00" | gcloud secrets versions add tburn_genesis_022_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-023 (community)
gcloud secrets create tburn_genesis_023_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd9d75886d6668609513f4ea45a009b98b622a91cc71c8da9b515c1af19464c35" | gcloud secrets versions add tburn_genesis_023_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-024 (community)
gcloud secrets create tburn_genesis_024_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x32d941024d138b57f1cce59fc5f8203b885e8a353c116586225cea14ccb443a8" | gcloud secrets versions add tburn_genesis_024_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-025 (community)
gcloud secrets create tburn_genesis_025_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x079e7d2eb383cb6cd503a95783541205a756af2fbf92b2262edcb9a5297b622b" | gcloud secrets versions add tburn_genesis_025_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-026 (community)
gcloud secrets create tburn_genesis_026_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4db888388d8c8ed7ab7566aa931f84eca010c016d241d5bb57663f9d0df4be0c" | gcloud secrets versions add tburn_genesis_026_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-027 (community)
gcloud secrets create tburn_genesis_027_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x6a12a91c4598ae22357d6dbb9f1b04b7393db98314102dce012a8ff4c6b5b31d" | gcloud secrets versions add tburn_genesis_027_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-028 (community)
gcloud secrets create tburn_genesis_028_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x420947a673624269bb33d745c06510b6f953287a1c5b37a1f16902453dc97ad3" | gcloud secrets versions add tburn_genesis_028_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-029 (community)
gcloud secrets create tburn_genesis_029_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd0be0fcf1ae14cbabb52672a140179f11cd58cabb3cc73fbbd993111ffb992f8" | gcloud secrets versions add tburn_genesis_029_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-030 (community)
gcloud secrets create tburn_genesis_030_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x46e9b3fa5c35b2712ec2bd70b5d25ae10592e1cc98c6daaf31427c629daaedaa" | gcloud secrets versions add tburn_genesis_030_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-031 (community)
gcloud secrets create tburn_genesis_031_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x18f804e1759e9772eb4de5916f0bf5d7741f7695689f2d7682d6835a660e8af5" | gcloud secrets versions add tburn_genesis_031_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-032 (community)
gcloud secrets create tburn_genesis_032_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x1dff24bc46b9ace6dd6478c2a6af2decfba714b1f9b6855c7ebf8c77bc4555ef" | gcloud secrets versions add tburn_genesis_032_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-033 (community)
gcloud secrets create tburn_genesis_033_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf4fcd2d44f6079b5f1c18ca2e0ec8298f6a70c656b8f13f2d0556e07fc7a9fd1" | gcloud secrets versions add tburn_genesis_033_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-034 (community)
gcloud secrets create tburn_genesis_034_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd1a2455ff4823591fdce6517be2fbcaa74d2ee736e74ce08b64abb1a7dd28473" | gcloud secrets versions add tburn_genesis_034_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-035 (community)
gcloud secrets create tburn_genesis_035_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x4a51cbc2e598671520e5002cadf7c98a377644339be80663217d883a9a235585" | gcloud secrets versions add tburn_genesis_035_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-036 (community)
gcloud secrets create tburn_genesis_036_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa56032dd41a21f738f3d3e927509739a105b9083578e299952735de973167699" | gcloud secrets versions add tburn_genesis_036_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-037 (community)
gcloud secrets create tburn_genesis_037_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x60d1c1dc6f2ad924a0e07d19c516413a9e467082cd1ff880037e3fcb7d6a54c4" | gcloud secrets versions add tburn_genesis_037_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-038 (community)
gcloud secrets create tburn_genesis_038_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x437618b278955f3c83d77f768405f5c1cfb30a650ef1bed2f0af84109d2404b4" | gcloud secrets versions add tburn_genesis_038_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-039 (community)
gcloud secrets create tburn_genesis_039_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x0dddbec34eadfa76df148f467e6c75a5474d1d15d5aa6f7e5d21840a8b3adc56" | gcloud secrets versions add tburn_genesis_039_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-040 (community)
gcloud secrets create tburn_genesis_040_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xf609405bb9a608d2c2aafaf9fba3958414a11fce96ad1d1a1791361a141725da" | gcloud secrets versions add tburn_genesis_040_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-041 (community)
gcloud secrets create tburn_genesis_041_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x9c478f4c7f21dd01320771c7f4ededadef3743c377b2a4d0354760c3b0339f14" | gcloud secrets versions add tburn_genesis_041_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-042 (community)
gcloud secrets create tburn_genesis_042_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xd3b6940df4c847c111051dc97a3ee69d454a052ca818c748311c6084d5a9184a" | gcloud secrets versions add tburn_genesis_042_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-043 (community)
gcloud secrets create tburn_genesis_043_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xc330fdb334e273d2f74f26bde95e3498329c20127376a90e68c29f6a16f345eb" | gcloud secrets versions add tburn_genesis_043_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-044 (community)
gcloud secrets create tburn_genesis_044_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xa60a11b5b1da0a21c160444d8f7ebd8d32b70751ffb491f984c334048744670e" | gcloud secrets versions add tburn_genesis_044_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-045 (community)
gcloud secrets create tburn_genesis_045_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x893ded877aa742010dafb7fd8e57dc36133c0744006258e8204c3ca98677a15e" | gcloud secrets versions add tburn_genesis_045_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-046 (community)
gcloud secrets create tburn_genesis_046_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x13c2660eda8d4756c3358eb81f07aeb2d3ad19b63fbecdfc30665330490528f5" | gcloud secrets versions add tburn_genesis_046_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-047 (community)
gcloud secrets create tburn_genesis_047_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x586ad5d85a13259a30444ae2ee144792fa4c431c8397b10985ffb73b22845366" | gcloud secrets versions add tburn_genesis_047_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-048 (community)
gcloud secrets create tburn_genesis_048_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0x5058a34ad291d959f78641b83f8ac13e9c7bae5d1bc4f53d2916932f155fa0db" | gcloud secrets versions add tburn_genesis_048_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-049 (community)
gcloud secrets create tburn_genesis_049_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xac6290becc719691d8457726d9b61a74e4d95ef671cfce55e6fca0aa801e5909" | gcloud secrets versions add tburn_genesis_049_key --project=$PROJECT_ID --data-file=-

# TBURN-Genesis-050 (community)
gcloud secrets create tburn_genesis_050_key --project=$PROJECT_ID --replication-policy=automatic 2>/dev/null
echo -n "0xec87e7ffb0c9603c494bae4367c0fd75fcc9ce0af087f2d87ff2d4c3de8fbb76" | gcloud secrets versions add tburn_genesis_050_key --project=$PROJECT_ID --data-file=-

