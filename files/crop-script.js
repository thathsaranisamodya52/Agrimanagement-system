document.getElementById('cropForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Input දත්ත ලබා ගැනීම
    const cropType = document.getElementById('cropType').value;
    const plantDateVal = document.getElementById('plantDate').value;

    if (!cropType || !plantDateVal) return;

    // දින ගණන (Age) සෙවීම
    const plantDate = new Date(plantDateVal);
    const today = new Date();
    const timeDiff = today.getTime() - plantDate.getTime();
    const daysAge = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysAge < 0) {
        alert("කරුණාකර අතීත හෝ අද දිනය තෝරන්න!");
        return;
    }

    // UI මාරු කිරීම
    document.getElementById('noDataMessage').style.display = 'none';
    document.getElementById('cropStatusDisplay').style.display = 'block';

    // සිංහල නම් සැකසීම
    let cropName = "";
    if(cropType === 'tomato') cropName = "තක්කාලි";
    else if(cropType === 'chili') cropName = "මිරිස්";
    else if(cropType === 'paddy') cropName = "වී වගාව";

    document.getElementById('resName').innerText = cropName;
    document.getElementById('resAge').innerText = "දින " + daysAge + " කි";

    // බෝග අනුව උපදෙස් සහ Notification වෙනස් කිරීම
    let fertText = "";
    let waterText = "";
    let showFertNotify = false;
    let showWaterNotify = false;

    if (cropType === 'tomato') {
        waterText = "දින 2-3 කට වරක් මුල් අවදියේදී මධ්‍යස්ථව ජලය සපයන්න.";
        showWaterNotify = true; // තක්කාලිවලට නිතර ජලය අවශ්‍යයි
        
        if (daysAge <= 14) {
            fertText = "දින 14 දී මුල්ම යුරියා සහ මූලික පොහොර මිශ්‍රණය යොදන්න.";
            if(daysAge >= 12) showFertNotify = true;
        } else if (daysAge <= 45) {
            fertText = "මල් පිපෙන අවධියයි: ටී.එස්.පී (TSP) පොහොර යෙදීමට සලකා බලන්න.";
        } else {
            fertText = "ගෙඩි හටගන්නා අවධිය: පොටෑසියම් බහුල පොහොර යොදන්න.";
        }
    } 
    else if (cropType === 'chili') {
        waterText = "පස වියළි බව පෙනේ නම් පමණක් ජලය දමන්න (අධික ජලය නරකයි).";
        if (daysAge % 4 === 0) showWaterNotify = true;

        if (daysAge <= 21) {
            fertText = "පැළ කර සති 2-3 කින් පළමු මතුපිට පොහොර යෙදීම සිදු කරන්න.";
            if(daysAge >= 18) showFertNotify = true;
        } else {
            fertText = "මල් සහ කරල් හටගන්නා විට නියමිත පොහොර මිශ්‍රණය යොදන්න.";
        }
    } 
    else if (cropType === 'paddy') {
        waterText = "ගොයම් පැළ බැඳෙන තෙක් කුඹුරේ අඟල් 2ක් පමණ ජලය රඳවා තබන්න.";
        
        if (daysAge <= 14) {
            fertText = "වපුරා දින 14 දී පළමු මතුපිට පොහොර (V1 මිශ්‍රණය) යොදන්න.";
            if(daysAge >= 10) showFertNotify = true;
        } else if (daysAge <= 35) {
            fertText = "වපුරා දින 35 දී දෙවන මතුපිට පොහොර (V2 මිශ්‍රණය) යොදන්න.";
        } else {
            fertText = "පීදෙන අවධියට පෙර බන්ඩි පොහොර (MOP) යෙදීමට සූදානම් වන්න.";
        }
    }

    // දත්ත තිරයට දැමීම
    document.getElementById('resFertilizer').innerText = fertText;
    document.getElementById('resWater').innerText = waterText;

    // 🔔 Notification පෙන්වීම
    document.getElementById('fertNotify').style.display = showFertNotify ? 'block' : 'none';
    document.getElementById('waterNotify').style.display = showWaterNotify ? 'block' : 'none';
});
