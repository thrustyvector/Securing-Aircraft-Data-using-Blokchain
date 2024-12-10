from flask import Flask, request, jsonify, render_template
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
from flask_cors import CORS


model = load_model('engine_failure_model.h5') 
model.summary()
scaler = MinMaxScaler()
dfTest = pd.read_pickle('dfTest.pkl') 

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
def recommend_failure(unit_id, RUL_MAX, df, model, scaler):
    # isolated data for the given engine id
    df_engine = df[df['unit_id'] == unit_id].copy() 
    if df_engine.empty:
        return f"No data found for engine ID {unit_id}."
    # most recent 70 cycles from the filtered data
    last_cycles = df_engine.tail(70)
    #if less than 70 cycles then the the model adds padding of 0s
    if len(last_cycles) < 70:
        padding = pd.DataFrame(
            np.zeros((70 - len(last_cycles), last_cycles.shape[1])),
            columns=last_cycles.columns
        )
        last_cycles = pd.concat([padding, last_cycles], ignore_index=True)
    # calculating maximum number of cycles which is the most recent one
    max_cycles = last_cycles['cycles'].max()
    last_cycles['RUL'] = (max_cycles + RUL_MAX) - last_cycles['cycles']
    columns_to_drop = ['s22', 's23']
    last_cycles.drop([col for col in columns_to_drop if col in last_cycles.columns], axis=1, inplace=True)
    #calculuate number of features excluding unit id, cycles and RUL
    num_features = last_cycles.shape[1] - 3  
    #padding of features of less than 18 because model expects 18
    if num_features < 18:
        for i in range(18 - num_features):
            last_cycles[f'pad_feature_{i}'] = 0
    elif num_features > 18:
        drop_count = num_features - 18
        last_cycles = last_cycles.iloc[:, :-drop_count]
    #binary label 1 if less than 30, 0 otherwise
    last_cycles['label30'] = np.where(last_cycles['RUL'] < 30, 1, 0)
    #input data
    inputNP = last_cycles.iloc[:, 1:-2].values  
    inputNP = inputNP.reshape(1, 70, 18) 
    print(f"testLSTM shape: {inputNP.shape}")
    testLabel = np.array([last_cycles['label30'].iloc[-1]]).reshape(1, 1)
    resultTest = model.evaluate(inputNP, testLabel)
    if resultTest[0] < 0.5:  
        return f"Engine ID {unit_id} is predicted to fail within the next 30 cycles."
    else:
        return f"Engine ID {unit_id} is not predicted to fail within the next 30 cycles."

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        unit_id = int(data.get('unit_id', -1))
        RUL_MAX = int(data.get('RUL_MAX', 0))

        if unit_id == -1 or RUL_MAX <= 0:
            return jsonify({'error': 'Invalid input data. Ensure unit_id and RUL_MAX are provided correctly.'}), 400

        response = recommend_failure(unit_id, RUL_MAX, dfTest, model, scaler)
        return jsonify({'message': response})
    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
