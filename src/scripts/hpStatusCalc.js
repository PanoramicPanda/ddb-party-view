function hpStatusCalc(currentHp, maxHp) {
  const hpPercentage = Math.floor(((currentHp / maxHp) * 100));
  if (hpPercentage > 90) {
    return { status: 'Healthy', percentage: 100 };
  } else if (hpPercentage > 70) {
    return { status: 'Lightly Wounded', percentage: 90 };
  } else if (hpPercentage > 30) {
    return { status: 'Moderately Wounded', percentage: 70 };
  } else if (hpPercentage > 10) {
    return { status: 'Severely Wounded', percentage: 30 };
  } else if (hpPercentage > 0) {
    return { status: 'Near Death', percentage: 10 };
  } else {
    return { status: 'Unconscious', percentage: 0 };
  }
}

export default hpStatusCalc;