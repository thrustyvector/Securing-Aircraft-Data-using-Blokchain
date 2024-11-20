// import contractdetails from '../build/contracts/AircraftMaintenance.json';
// const contractDetails = require('../build/contracts/AircraftMaintenance.json')

document.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // No need to ask for account access
    } else {
      console.error("No Ethereum interface injected into browser. Install MetaMask!");
      return;
    }
  
    // Contract ABI (Artifact)
    
    const response = await fetch('../build/contracts/AircraftMaintenance.json');  // Update the path if necessary
    const jsonData = await response.json();  // Parses the JSON response into an object
          
          // Now you can access the data
          console.log(jsonData);  // Output: My Contract
          console.log(jsonData.address);  // Output: 0x1234abcd5678efgh
          console.log(jsonData.networkId);  // Output: 5777
          const contractABI = jsonData.abi;
          const contractAddress = jsonData.networks[5777].address;
          // You can also use the data in your Web3 setup if needed
          // const contractAddress = jsonData.address;
          // const contractABI = ... (your ABI data)
          


          // Initialize contract instance
          const contract = new web3.eth.Contract(contractABI, contractAddress);
  
    // Handle form submission
    const form = document.getElementById('maintenanceForm');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const aircraftName = form.aircraftName.value;
      const partsExchanged = form.partsExchanged.value;
      const currentMaintenanceDate = new Date(document.getElementById('currentMaintenanceDate').value).getTime() / 1000; // Convert to Unix timestamp
      const upcomingMaintenanceDate = new Date(document.getElementById('upcomingMaintenanceDate').value).getTime() / 1000; // Convert to Unix timestamp
  
      try {
        // Send transaction to add maintenance record
        const accounts = await web3.eth.getAccounts();
        let result = await contract.methods.addMaintenanceRecord(aircraftName, partsExchanged,currentMaintenanceDate,upcomingMaintenanceDate).send({ from: accounts[0] });
        console.log(` transaction hash for the added block ${result.transactionHash}`)
        // Display success message
        document.getElementById('result').innerHTML = `<p>Successfully added maintenance record for ${aircraftName}</p>`;
  
        // Clear form fields
        form.reset();
      } catch (error) {
        console.error("Error adding maintenance record:", error);
        document.getElementById('result').innerHTML = `<p>Error adding maintenance record: ${error.message}</p>`;
      }
    });
    // Function to fetch all maintenance records for an aircraft
    async function getAllMaintenanceRecords(aircraftId) {
        try {
            const aircraftCount = await contract.methods.recordId().call(); // Assuming recordId increments for each aircraft ID
            console.log(`Total Aircraft Count: ${aircraftCount}`);
            const records=[];
            for (let i = 1; i <= aircraftCount; i++) {
                const record = await contract.methods.getMaintenanceRecords(i).call();
                records.push(record)
                console.log(`record: ${record}`)
                console.log(`Maintenance Records for Aircraft ID ${i}:`);
                record.forEach(r => {
                    console.log('Aircraft Name:', r.aircraftName);
                    console.log('Parts Exchanged:', r.partsExchanged);
                    console.log('Timestamp:', new Date(r.timestamp * 1000)); // Convert timestamp to human-readable format
                    console.log('----------------------');
                    console.log(r);
                });
            }
            return records;
        } catch (error) {
            console.error('Error fetching maintenance records:', error);
            return [];
        }
    }

    // Function to display maintenance records on the web page
    async function displayMaintenanceRecords() {
        const aircraftId = 1; // Replace with the ID of the aircraft you want to display records for
        const records = await getAllMaintenanceRecords(aircraftId);

        const recordsContainer = document.getElementById('maintenance-records');
        recordsContainer.innerHTML = ''; // Clear previous records
        let count =0;
        records.forEach(record => {
            let name = "",parts="",latest,upcoming;
            record.forEach(r=>{
                count++;
                name = r.aircraftName
                parts = r.partsExchanged
                latest=new Date(r.currentMaintenanceDate*1000);
                upcoming = new Date(r.upcomingMaintenanceDate*1000);

            })
            const recordElement = document.createElement('div');
            recordElement.innerHTML = `
                <br><p><strong>Aircraft_id:</strong> ${count}</p><br>
                <p><strong>Name:</strong> ${name}</p><br>
                <p><strong>Issue:</strong> ${parts}</p><br>
                <p><strong>Latest Maintenance Date:</strong> ${latest}</p><br>
                <p><strong>Upcoming Maintenance Date:</strong> ${upcoming}</p><br>
                <hr>
            `;
            recordsContainer.appendChild(recordElement);
        });
    }

    // Add event listener to the button
    const fetchRecordsButton = document.getElementById('fetch-records-button');
    fetchRecordsButton.addEventListener('click', () => {
        displayMaintenanceRecords();
    });
  });
  