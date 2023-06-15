function isValidSearchQuery(query) {
    // Remove leading and trailing whitespace
    query = query.replace(/\s/g, '');
  
    // Check if the query is empty
    if (query.length === 0) {
      return false;
    }
  
    // Add additional validation criteria as per your requirements
    if (!/^[a-zA-Z0-9-_]+$/.test(query)) {
      return false;
    }
  
    // Return true if the query passes all validation checks
    return true;
  }  

  module.exports = isValidSearchQuery;  
