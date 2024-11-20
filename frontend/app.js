document.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
    } catch (error) {
      console.error("User denied account access or error occurred:", error);
    }
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.error(
      "No Ethereum interface injected into browser. Install MetaMask!"
    );
    return;
  }

  const response = await fetch("../build/contracts/AircraftMaintenance.json");
  const jsonData = await response.json();

  const contractABI = jsonData.abi;
  const contractAddress = jsonData.networks[5777].address;

  // Initialize contract instance
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Function to calculate RUL based on sensor values and weights
  function calculateRUL(baseRUL, sensorValues) {
    const weights = [0.2, 0.15, 0.1, 0.1, 0.25, 0.05, 0.1, 0.05]; // Weights for EGT, CDP, Oil Temperature, Oil Pressure, Vibration, Fuel Flow, N1 Speed, TIT

    let weightedSum = 0;
    for (let i = 0; i < sensorValues.length; i++) {
      weightedSum += sensorValues[i] * weights[i];
    }

    let RUL = baseRUL - (weightedSum / 100) * 5; //maxImpact;
    // const  = 5; // Ensure RUL doesn't drop below 5
    // if (RUL < maxImpact) {
    //   return maxImpact;
    // }

    return RUL;
  }

  // Handle form submission
  const form = document.getElementById("maintenanceForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const aircraftName = form.aircraftName.value;
    const engineId = form.engineId.value;

    const egt = form.egt.value;
    const cdp = form.cdp.value;
    const oilTemperature = form.oilTemperature.value;
    const oilPressure = form.oilPressure.value;
    const vibration = form.vibration.value;
    const fuelFlow = form.fuelFlow.value;
    const n1Speed = form.n1Speed.value;
    const tit = form.tit.value;

    const response = await fetch("../engine_rul.json"); // Path to the engine_rul.json file
    const engineRulData = await response.json();
    const baseRUL = engineRulData[engineId];

    if (!baseRUL) {
      document.getElementById(
        "result"
      ).innerHTML = `<p>Error: No base RUL found for engine ID ${engineId}</p>`;
      return;
    }

    const sensorValues = [
      parseInt(egt),
      parseInt(cdp),
      parseInt(oilTemperature),
      parseInt(oilPressure),
      parseInt(vibration),
      parseInt(fuelFlow),
      parseInt(n1Speed),
      parseInt(tit),
    ];

    const RUL = calculateRUL(baseRUL, sensorValues);

    try {
      const accounts = await web3.eth.getAccounts();

      let result = await contract.methods
        .addMaintenanceRecord(aircraftName, engineId, sensorValues, RUL)
        .send({ from: accounts[0] });

      console.log(
        `Transaction hash for the added block: ${result.transactionHash}`
      );

      document.getElementById(
        "result"
      ).innerHTML = `<p>Successfully added maintenance record for ${aircraftName} with RUL: ${RUL}</p>`;

      form.reset();
    } catch (error) {
      console.error("Error adding maintenance record:", error);
      document.getElementById(
        "result"
      ).innerHTML = `<p>Error adding maintenance record: ${error.message}</p>`;
    }
  });

  // Function to fetch all maintenance records for an aircraft
  async function getAllMaintenanceRecords(aircraftId) {
    try {
      const aircraftCount = await contract.methods.recordId().call();
      console.log(`Total Aircraft Count: ${aircraftCount}`);
      const records = [];
      for (let i = 1; i <= aircraftCount; i++) {
        const record = await contract.methods.getMaintenanceRecords(i).call();
        records.push(record);
        console.log(`Maintenance Records for Aircraft ID ${i}:`);
        record.forEach((r) => {
          console.log("Aircraft Name:", r.aircraftName);
          console.log("Engine ID:", r.engineId);
          console.log("Sensor Values:", r.sensorValues);
          console.log("RUL:", r.RUL); // Log the RUL
        });
      }
      return records;
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      return [];
    }
  }

  // Function to display maintenance records on the web page
  async function displayMaintenanceRecords() {
    const aircraftId = 1; // Replace with the ID of the aircraft you want to display records for
    const records = await getAllMaintenanceRecords(aircraftId);

    const recordsContainer = document.getElementById("maintenance-records");
    recordsContainer.innerHTML = ""; // Clear previous records
    let count = 0;
    records.forEach((record) => {
      record.forEach((r) => {
        count++;
        const name = r.aircraftName;
        const engineId = r.engineId;
        const sensorValues = r.sensorValues;
        const RUL = r.RUL;

        const egt = sensorValues[0];
        const cdp = sensorValues[1];
        const oilTemperature = sensorValues[2];
        const oilPressure = sensorValues[3];
        const vibration = sensorValues[4];
        const fuelFlow = sensorValues[5];
        const n1Speed = sensorValues[6];
        const tit = sensorValues[7];

        const recordElement = document.createElement("div");
        recordElement.innerHTML = `
              <br><p><strong>Maintenance Record #${count}</strong></p><br>
              <p><strong>Aircraft Name:</strong> ${name}</p><br>
              <p><strong>Engine ID:</strong> ${engineId}</p><br>
              <p><strong>RUL:</strong> ${RUL}</p><br>
              <p><strong>EGT (°C):</strong> ${egt}</p><br>
              <p><strong>CDP (psi):</strong> ${cdp}</p><br>
              <p><strong>Oil Temperature (°C):</strong> ${oilTemperature}</p><br>
              <p><strong>Oil Pressure (psi):</strong> ${oilPressure}</p><br>
              <p><strong>Vibration (mm/s):</strong> ${vibration}</p><br>
              <p><strong>Fuel Flow (L/hr):</strong> ${fuelFlow}</p><br>
              <p><strong>N1 Speed (RPM):</strong> ${n1Speed}</p><br>
              <p><strong>TIT (°C):</strong> ${tit}</p><br>
              <hr>
          `;
        recordsContainer.appendChild(recordElement);
      });
    });
  }

  const fetchRecordsButton = document.getElementById("fetch-records-button");
  fetchRecordsButton.addEventListener("click", () => {
    displayMaintenanceRecords();
  });
});
