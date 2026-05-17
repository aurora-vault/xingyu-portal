<template>
  <div class="logo-wrapper">
    <svg viewBox="300 250 1100 1200" class="stickman" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#33b8e4" />
          <stop offset="100%" stop-color="#0661b1" />
        </linearGradient>
      </defs>

      <circle cx="753" cy="396" r="112" fill="#0975c4" />
      <circle cx="1032" cy="388" r="112" fill="#0975c4" />

      <g fill="url(#bodyGrad)">
        <path d="M964.636 538.5C566.637 633 870.137 1064 369.137 1171C335.137 1178.26 296.137 1267.5 394.137 1286C974.637 1128.5 702.137 711 989.636 651.5C1017.14 669.5 974.137 808.357 1116.34 845.6C1170.64 859.821 1359.27 817.418 1340.74 726.7C1291.14 611.5 1213.64 757 1130.34 727.8C1093.14 714.76 1150.64 524.8 964.636 538.5Z" />
        <path d="M816.637 549.8C816.637 549.8 698.09 536 590.237 639C545.637 674.5 414.825 895 517.137 935.6C609.637 953.5 590.237 857.908 609.637 811.4C647.137 721.5 703.137 695 703.137 695C738.137 601.5 816.637 549.8 816.637 549.8Z" />
        <path d="M968.637 928C832.889 945.163 797.128 1095.58 716.837 1182.4C631.137 1286 543.858 1272.44 563.137 1344.3C644.637 1501 879.883 1168.5 916.637 1096.5C1023.18 928 1189.32 1182.4 1245.14 1357C1269.75 1433.99 1381.43 1398 1351.94 1310.5C1299.59 1155.21 1174.45 903.787 968.637 928Z" />
        <path d="M971.637 1100.5L911.137 1193.9C1034.14 1306 1032.75 1450.9 1118.74 1403.3C1221.14 1346.61 1010.14 1134 971.637 1100.5Z" />
      </g>
    </svg>
    <span class="brand-name">{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({ name: { type: String, required: true } });
</script>

<style scoped>
.logo-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.stickman { width: 44px; height: 44px; transition: transform 0.4s ease; }
.logo-wrapper:hover .stickman { transform: scale(1.08) translateY(-2px); }
.brand-name {
  font-size: 24px; font-weight: 900; letter-spacing: 1.5px;
  background: linear-gradient(135deg, #0975c4, #0661b1);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
</style>
