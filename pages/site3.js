import { useState } from "react";
import styles from "../styles/site3.module.css";

const monkeys = [
  "Dart Monkey", "Tack Shooter", "Sniper Monkey", "Ninja Monkey", "Boomerang Monkey",
  "Bomb Shooter", "Ice Monkey", "Glue Gunner", "Monkey Buccaneer", "Monkey Sub",
  "Monkey Ace", "Heli Pilot", "Mortar Monkey", "Dartling Gunner", "Wizard Monkey",
  "Super Monkey", "Alchemist", "Druid", "Banana Farm", "Spike Factory",
  "Monkey Village", "Engineer Monkey"
];

const Site3 = () => {
  const [rolledMonkeys, setRolledMonkeys] = useState([]);
  const [upgradeDisplay, setUpgradeDisplay] = useState("");

  const rollMonkey = () => {
    const selectedMonkey = monkeys[Math.floor(Math.random() * monkeys.length)];
    setRolledMonkeys((prev) => [...prev, selectedMonkey]);
  };

  const rollUpgrade = (selectedMonkey) => {
    if (rolledMonkeys.length > 0) {
      const upgradeChoice = Math.floor(Math.random() * 3) + 1;
      setUpgradeDisplay(`You rolled: ${upgradeChoice} for ${selectedMonkey}`);
    } else {
      alert("Please roll a monkey first.");
    }
  };

  const rollRandomUpgrade = () => {
    if (rolledMonkeys.length > 0) {
      const selectedMonkey = rolledMonkeys[Math.floor(Math.random() * rolledMonkeys.length)];
      rollUpgrade(selectedMonkey);
    } else {
      alert("Please roll a monkey first.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Monkey Roller</h1>
      <button onClick={rollMonkey} className={styles.button}>Roll Monkey</button>
      <button onClick={rollRandomUpgrade} className={styles.button}>Roll Upgrade</button>
      <ul className={styles.monkeyList}>
        {rolledMonkeys.map((monkey, index) => (
          <li key={index}>{monkey}</li>
        ))}
      </ul>
      {upgradeDisplay && <div className={styles.upgradeDisplay}>{upgradeDisplay}</div>}
    </div>
  );
};

export default Site3;
