export default class Grid {
  constructor () {
    this.grid = [];
    this.rowNames = [];
    this.colNames = [];
  }

  show(){
    return JSON.stringify(this.grid);
  }

  // returns the griddy data object
  get data(){
    return {
      grid: JSON.parse(JSON.stringify(this.grid)),
      rowNames: JSON.parse(JSON.stringify(this.rowNames)),
      colNames: JSON.parse(JSON.stringify(this.colNames))
    }
  }
  
  // returns the names of all rows
  get rows(){
    return this.rowNames.slice();
  }
  
  // returns the names of all columns
  get cols(){
    return this.colNames.slice();
  }
  
  // returns the size of the grid
  get size(){
    return [this.rowNames.length,this.colNames.length];
  }

  // returns a row object by name
  getRow(rowName){
    let rPos = this.rowNames.indexOf(rowName);
    if (rPos==-1) return {};

    // get the row array
    let result = {};
    this.colNames.forEach((colName,cPos)=>{
      result[colName] = JSON.parse(JSON.stringify(this.grid[rPos][cPos]));
    });
    return result;
  }

  // returns a column object by name
  getCol(colName){
    let cPos = this.colNames.indexOf(colName);
    if (cPos==-1) return {};

    // get the col array
    let result = {};
    this.rowNames.forEach((rowName,rPos)=>{
      result[rowName] = JSON.parse(JSON.stringify(this.grid[rPos][cPos]));
    });
    return result;
  }
  
  // gets sthe value at a particular griddy location
  getValue(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.rowName==null || options.rowName=='') return reject('Must include a row name');
      if (options.colName==null || options.colName=='') return reject('Must include a column name');

      // parameters
      let rowName = options.rowName;
      let colName = options.colName;

      let rPos = this.rowNames.indexOf(rowName);
      let cPos = this.colNames.indexOf(colName);
      if (cPos==-1 || rPos==-1) return reject(`Named location doesn't exist`);
      return JSON.parse(JSON.stringify(this.grid[rPos][cPos]));
    });    
  }

  // this adds another row to the current grid, equal in length to existing rows
  addRow(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.name==null || options.name=='') return reject('Must include a row name');
      if (this.rowNames.indexOf(options.name)>-1) return reject(`Row name Already Exists`);
      if (options.rowNum!=null && typeof options.rowNum != 'number') return reject('Row must be number');

      // passed parameters
      let rowName = options.name;
      //let values = options.values ?? Array(this.colNames.length).fill({});
      let rPos = (options.rowNum==null) ? this.rowNames.length : options.rowNum-1;

      // don't let the user skip rows
      if (rPos-this.rowNames.length>0) return reject(`You are skipping blank rows`);

      // insert the new rowName and empty row
      this.rowNames.splice(rPos,0,rowName);
      this.grid.splice(rPos,0,Array(this.colNames.length).fill({}));

      // if values have been passed for the array, add them, too
      if (Object.hasOwnProperty.call(options,'values')) 
        this.setRow(options).catch(err => console.log('ERROR: ',err));

      return resolve();
    });
  }
  
  // this adds another column to the grid, equal in length to existing columns
  addCol(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.name==null || options.name=='') return reject('Must include a column name');
      if (this.colNames.indexOf(options.name)>-1) return reject(`Column name already exists`);
      if (options.colNum!=null && typeof options.colNum != 'number') return reject('Column must be number');

      // passed parameters
      let colName = options.name;
      let values = options.values ?? Array(this.rowNames.length).fill({});
      let cPos = (options.colNum==null) ? this.colNames.length : options.colNum-1;

      // don't let the user skip rows
      if (cPos-this.colNames.length>0) return reject(`You are skipping blank columns`);

      // insert the colName
      this.colNames.splice(cPos,0,colName);

      // insert a new column into every row
      for (let r=0;r<this.rowNames.length;r++) {
        //this.grid[r].splice(cPos,0,values[r]);
        this.grid[r].splice(cPos,0,{});
      }

      // if values have been passed, insert them, too
      if (Object.hasOwnProperty.call(options,'values')) 
        this.setCol(options).catch(err => console.log('ERROR: ',err));

      return resolve();
    });
  }

  // sets the object at a particular griddy location
  setValue(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.rowName==null || options.rowName=='') return reject('Must include a row name');
      if (options.colName==null || options.colName=='') return reject('Must include a column name');

      // parameters
      let rowName = options.rowName;
      let colName = options.colName;
      let values = options.values ?? {};

      let rPos = this.rowNames.indexOf(rowName);
      let cPos = this.colNames.indexOf(colName);
      if (cPos==-1 || rPos==-1) return reject(`Named location doesn't exist`);
      let newObj = JSON.parse(JSON.stringify(this.grid[rPos][cPos]));
      this.grid[rPos][cPos] = Object.assign(newObj,values);
    });
  }

  // sets the value of an entire row
  setRow(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.name==null || options.name=='') return reject('Must include a row name');
      if (options.values==null) return reject('Must include values');

      // parameters
      let rowName = options.name;
      let values = options.values;

      let rPos = this.rowNames.indexOf(rowName);
      if (rPos==-1) return reject(`${rowName} doesn't exist in grid`);

      // verify our values array is the right length and full of objects
      if (Array.isArray(values)) {
        if (values.length != this.colNames.length) return reject(`Values list wrong length`);
        let ok = values.reduce((acc,curr)=>{
          if (typeof curr !== 'object') acc=false;
          return acc;
        },true);
        if (!ok) return reject(`Values list must be of objects`);
      } else if (typeof values == 'object') values = Array(this.colNames.length).fill(values);
      else return reject(`Type of Values must be object`);

      // sets the grid row equal to the new values
      this.grid.splice(rPos,1,values);

      return resolve();
    });
  }

  // sets the value of an entire column
  setCol(options){
    return new Promise((resolve,reject)=>{
      // validation
      if (options.name==null || options.name=='') return reject('Must include a column name');
      if (options.values==null) return reject('Must include values');

      // parameters
      let colName = options.name;
      let values = options.values;

      let cPos = this.colNames.indexOf(colName);
      if (cPos==-1) return reject(`${colName} doesn't exist in grid`);

      // if an array was passed, make sure it's the right length and full of objects
      if (Array.isArray(values)) {
        if (values.length != this.rowNames.length) return reject(`Values list wrong length`);
        let ok = values.reduce((acc,curr)=>{
          if (typeof curr !== 'object') return false;
          return acc;
        },true);
        if (!ok) return reject(`Values list must be of objects`);
      } else if (typeof values == 'object') values = Array(this.rowNames.length).fill(values);
      else return reject(`Type of Values must be object`);

      // insert a new column into every row
      for (let r=0;r<this.rowNames.length;r++) {
        this.grid[r].splice(cPos,1,values[r]);
      }

      return resolve();
    });    
  }
}