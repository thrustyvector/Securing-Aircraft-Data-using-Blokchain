// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

contract AircraftMaintenance {
    // Struct to store maintenance and sensor data
    struct MaintenanceRecord {
        string aircraftName;
        uint engineId;
        uint[8] sensorValues; // Array to store values from 8 sensors
        uint RUL; // Remaining Useful Life for this record
    }

    // Mapping to store maintenance records by aircraft ID
    mapping(uint => MaintenanceRecord[]) public maintenanceRecords;

    // Counter for maintenance record IDs
    uint public recordId;

    // Event emitted when a maintenance record is added
    event MaintenanceRecordAdded(
        uint indexed id,
        string aircraftName,
        uint engineId,
        uint[8] sensorValues,
        uint RUL
    );

    // Function to add a new maintenance record
    function addMaintenanceRecord(
        string memory _aircraftName,
        uint _engineId,
        uint[8] memory _sensorValues,
        uint _RUL
    ) public {
        // Increment record ID
        recordId++;

        // Add the record to the maintenance records
        maintenanceRecords[recordId].push(
            MaintenanceRecord(
                _aircraftName,
                _engineId,
                _sensorValues,
                _RUL
            )
        );

        // Emit event when a record is added
        emit MaintenanceRecordAdded(
            recordId,
            _aircraftName,
            _engineId,
            _sensorValues,
            _RUL
        );
    }

    // Function to get all maintenance records for an aircraft by ID
    function getMaintenanceRecords(uint _aircraftId) public view returns (MaintenanceRecord[] memory) {
        return maintenanceRecords[_aircraftId];
    }

    // Function to get a specific maintenance record by index for an aircraft ID
    function getMaintenanceRecord(uint _aircraftId, uint _index) public view returns (
        string memory,
        uint,
        uint[8] memory,
        uint
    ) {
        require(_index < maintenanceRecords[_aircraftId].length, "Index out of bounds");
        MaintenanceRecord memory record = maintenanceRecords[_aircraftId][_index];
        return(
            record.aircraftName,
            record.engineId,
            record.sensorValues,
            record.RUL
        );
    }
}
