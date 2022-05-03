# from flask import Flask, render_template, request, json, jsonify
import numpy as np
import csv
import pandas as pd
import re
import struct
import sklearn as sk
import json
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn import manifold
from sklearn.manifold import MDS
from sklearn.metrics import euclidean_distances
from collections import Counter

# app = Flask(__name__)

dataset = pd.read_csv("southeastData.csv", index_col=None, header=0, engine='python')
labs = ['LitAvg','NumAvg','Pop', 'Education', 'Pov','NoIns','MedIncome','Unemployment','VCR','JPR']
ind = [2,3,4,5,7,8,9,10,11,12]
indB = [0,2,3,4,5,6,7,8,9,10,11,12,13]
X = dataset.iloc[:,ind].values

labsB = ['State','County','LitAvg','NumAvg','Pop', 'Education', 'Industry','Pov','NoIns','MedIncome','Unemployment','VCR','JPR','Size']

Y = pd.DataFrame(X,columns=ind)
corrA = Y.corr()
corrM = 1 - abs(corrA)
embeddingB = MDS(n_components=2,dissimilarity='precomputed')
X_tB = embeddingB.fit_transform(corrM)
Z = pd.DataFrame(dataset.iloc[:,indB],columns=labsB)
Z["State"] = Z["State"].astype('category')
Z["State"] = Z["State"].cat.codes
Z["Industry"] = Z["Industry"].astype('category')
Z["Industry"] = Z["Industry"].cat.codes
Z["Size"] = Z["Size"].astype('category')
Z["Size"] = Z["Size"].cat.codes

# @app.route('/')
# def index():
#     return render_template('index.html')


# @app.route('/mdsB', methods=['POST'])
def mdsB():
    vars = json.loads(request.get_data().decode())
    K = pd.DataFrame(dataset.values,columns=labsB)

    if vars[0][0] != "none":
        if vars[1][0] != "none":
            L = K.loc[K[str(vars[0][1])] == str(vars[0][0])]
            L = L.loc[K[str(vars[1][1])] == str(vars[1][0])]
            L = L[labs]
            corr = L.astype(float).corr().values.tolist()
        else:
            L = K.loc[K[str(vars[0][1])] == str(vars[0][0])]
            L = L[labs]
            corr = L.astype(float).corr().values.tolist()
    else:
        if vars[1][0] != "none":
            L = K.loc[K[vars[1][1]] == vars[1][0]]
            L = L[labs]
            corr = L.astype(float).corr().values.tolist()
        else:
            corr = corrA.values.tolist()
    dict = {}
    nodes = []
    links = []
    for i in range(len(labs)):
        id = labs[i];
        nodes.append({"id": id});

    for i in range(len(labs)):
        for j in range(len(labs)):
            if i!=j:
                links.append({"source": labs[i], "target":labs[j], "value": corr[i][j]})
    dict["nodes"] = nodes
    dict["links"] = links
    return json.dumps(dict)

# @app.route('/mdsBCounties', methods=['POST'])
def mdsBCounties():
    vars = json.loads(request.get_data().decode())
    K = pd.DataFrame(dataset.values,columns=labsB)
    L = K.loc[K['County'].isin(vars)]
    L = L[labs]
    corr = L.astype(float).corr().values.tolist()
    dict = {}
    nodes = []
    links = []

    for i in range(len(labs)):
        id = labs[i];
        nodes.append({"id": id});

    for i in range(len(labs)):
        for j in range(len(labs)):
            if i!=j:
                links.append({"source": labs[i], "target":labs[j], "value": corr[i][j]})
    dict["nodes"] = nodes
    dict["links"] = links
    return json.dumps(dict)


# @app.route('/marimekko', methods=['POST'])
def marimekko():
    vars = json.loads(request.get_data().decode())
    df1 = dataset[vars[0]]
    df2 = dataset[vars[1]]
    result = zip(df1,df2)

    return json.dumps([{vars[0]:pair[0],vars[1]:pair[1],"value":count} for pair,count in Counter(result).items()])

# @app.route('/marimekkoBounds', methods=['POST'])
def marimekkoBounds():
    vars = json.loads(request.get_data().decode())
    K = pd.DataFrame(dataset.values,columns=labsB)
    L = K.loc[K['County'].isin(vars[2])]
    df1 = L[vars[0]]
    df2 = L[vars[1]]
    result = zip(df1,df2)

    return json.dumps([{vars[0]:pair[0],vars[1]:pair[1],"value":count} for pair,count in Counter(result).items()])



# if __name__ == '__main__':
#     app.run(debug=True)
