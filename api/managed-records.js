import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

const retrieve = (options = {}) => {
 let request = new FetchRequest(options)
 return fetch(request.uri())
 .then((response) => response.json())
 .then((json) => {
    request.formatResults(json)
    return new Promise((resolve, reject) => {
      resolve(request.formattedResponse);
    })
  })
  .catch((error) => console.log("There was an error. Please review your request and try again."))
}
  
function FetchRequest(options) {
 this.page = options["page"];
 this.colors = options["colors"];
}
  
FetchRequest.prototype.uri = function() {
   let uri = URI(window.path)
   uri.addSearch("limit", "11")
    if(this.page != undefined) {
     let offset = (this.page - 1) * 10
     uri.addSearch("offset", offset)
    }
    if(this.colors != undefined) {
      this.colors.forEach(function(color){
         uri.addSearch("color[]", color)
       })
    }
   return uri.toString()
}
  
FetchRequest.prototype.formatResults = function(resultsJSON) {
  this.json = resultsJSON;
  this.getNextPage();
  this.getPreviousPage();
  this.processJsonToRecords();
  this.getIds();
  this.getOpenRecords();
  this.countClosedPrimaryRecords();
  this.formatResponse();
}
  
FetchRequest.prototype.getPreviousPage = function() {
    if(this.page == undefined || this.page == 1) {
      this.previousPage = null
    } else {
      this.previousPage = this.page - 1
    }
}
  
FetchRequest.prototype.getNextPage = function() {
    if(this.json.length < 11) {
      this.nextPage = null
    } else if (this.page == undefined) {
      this.nextPage = 2
    } else {
      this.nextPage = this.page + 1
    }
}
  
FetchRequest.prototype.processJsonToRecords = function() {
    if(this.json.length > 0) {
      this.records = this.json.splice(0, 10).map(function(record) {
         record["isPrimary"] = isColorPrimary(record["color"])
         return record
       })
    } else {
      this.records = []
    }
}
  
const isColorPrimary = (color) => {
    if(["red","yellow","blue"].indexOf(color) >= 0) {
      return true
    } else {
      return false
    }
}
  
FetchRequest.prototype.getIds = function() {
    if(this.records.length > 0) {
      this.ids = this.records.map(function(record) {
         return record.id
       })
    } else {
      this.ids = []
    }
}
  
FetchRequest.prototype.getOpenRecords = function() {
    if(this.records.length > 0) {
      this.open = this.records.filter(function(record) {
         return record.disposition == "open"
       })
    } else {
      this.open = []
    }
}
  
FetchRequest.prototype.countClosedPrimaryRecords = function() {
    if(this.records.length > 0) {
        this.closedPrimaryCount = this.records.filter(function(record) {
            return record.disposition == "closed" && record.isPrimary
        }).length
    } else {
        this.closedPrimaryCount = 0
    }
}
  
FetchRequest.prototype.formatResponse = function() {
  let response = {}
  response["previousPage"] = this.previousPage;
  response["nextPage"] = this.nextPage;
  response["ids"] = this.ids;
  response["open"] = this.open;
  response["closedPrimaryCount"] = this.closedPrimaryCount;
  this.formattedResponse = response
}

export default retrieve;
