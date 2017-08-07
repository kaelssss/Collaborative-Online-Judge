import json
from flask import Flask
from flask import jsonify
from flask import request
import executor_utils as eu

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello world'

@app.route('/build_and_run', methods=['POST'])
def build_and_run():
    data = json.loads(request.data)
    ## here, we got data: it's a dict, 
    ## when refering to a dict: data['propName']
    ## make sense when json obj is converted to a dict
    if 'code' not in data or 'lang' not in data:
        return 'wrong data sent to me, dude'
    code = data['code']
    lang = data['lang']
    print 'I got u bro: %s and %s' %(code, lang)
    result = eu.build_and_run(code, lang)
    return jsonify(result)

if __name__ == '__main__':
    eu.load_image()
    app.run(debug=True)