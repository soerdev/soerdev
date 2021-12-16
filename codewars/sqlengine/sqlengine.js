/**
*  Tokenizing
*/

const getLexeme = (source) =>{
  let tokens = [];

  const templates = {
    keyword: /^(?:SELECT|FROM|JOIN|ON|WHERE)\b/i,
    number: /^-?\d+(?:\.\d+)?/,
    string: /^(?:'[^']*')+/,
    punct: /^[.,]/,
    name: /^[0-9A-Za-z_]+/,
    cmp: /^(?:<=|>=|<>|<|>|=)/,
    space: /^\s+/,
  }


  for(const type in templates){
    if (tokens = source.match(templates[type])){
      return tokens.map( value => ({type, value}))[0];
    }
  }
  return false;
}

const tokenizing = (source) => {
  let tokens = [];
  let token = {value:'', type:''};
  while(token = getLexeme(source) ){
      source = source.replace(new RegExp('^'+token.value, 'i'), '').trim();
      if(token.type == 'keyword') token.value = token.value.toUpperCase();
      if(token.type == 'string') token.value = token.value.substr(1, token.value.length-2).replace("''", "'");
      
      tokens.push(token);
  }
  return tokens;
}

/**
*  Parsing
*/
parse = (tokens) => {
  let pointer = 0;

  let table = '';  
  const columns = [];
  const joins = [];
  const where = [];

  const error = (msg) => { throw(new Error(msg)); }
  const peek = () => tokens[pointer];
  const next = () => tokens[pointer++];
  const match= (token) => peek() && peek().value == token;
  const expect = (token) => (peek().value == token && next()) || error("Expect keyword " + token+ " instead got " + peek().value)
  const expectType = (t) => (peek().type == t && next()) || error("Expect type " + t + " instead got " + peek().value)
  const getColumnName = () => {return {type:'column', value: expectType('name').value + expectType('punct').value + expectType('name').value}; }
  const getName = () => expectType('name').value
  const getField = () => {
        if ( ['number', 'string'].includes(peek().type)) return next();
        return getColumnName();
  }
  const getCondition = () => {return {leftSide: getColumnName(), sign: expectType('cmp').value, rightSide: getField()}; }

  if(expect("SELECT")) {
     columns.push(getColumnName())
     while(match(',')) {
        next();
        columns.push(getColumnName())
     }   
  }

  if(expect("FROM")) {
     table = getName()
     while(match("JOIN")) {
        next();
        joins.push({
            table: getName(),
            condition: expect('ON') && getCondition()
        });
     }
  }

  if(match("WHERE")) {
      next();
      where.push(getCondition());
  }
  

  return {columns, table, joins, where}
}

/**
*  Engine
*/
// select, ws, from, [ ws, join ], [ ws, where ] ;
// select table_name.id from table_name "JOIN ", table-name, " on ", value-test "WHERE ", value-test ;
engine = (db, q) => {
  const normalize = (t) => db[t].map( row => {r = {}; for(key in row) r[`${t}.${key}`] = row[key]; return r; });
  const columnName = (c) => c.value;

  const cmp = {
      '=': (a, b) => a == b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      '<>': (a, b) => a != b
  }
  const getValue = (token, row) => {
      if( ['string', 'number'].includes(token.type) ) return token.value;
      if( token.type == 'column') return row[token.value];
      throw new Error("Expect variable");
  }

  const combine = (r1, r2) => Object.assign({}, r1, r2);
  const f = (row, cnd) => cmp[cnd.sign](getValue(cnd.leftSide, row), getValue(cnd.rightSide, row))  
  const leftJoin = (t1, t2, cnd) => {
        let r = [];
        t1.forEach(r1 => t2.forEach(r2 => r.push(combine(r1,r2))))
        return r.filter(row => f(row, cnd))
  }


  let result = normalize(q.table);
  if (q.joins.length > 0) q.joins.forEach(t => { result = leftJoin(result, normalize(t.table), t.condition)}); 
  if (q.where.length == 1)  result = result.filter(row => f(row, q.where[0]));

  return result.map(row => { r = {}; q.columns.map( col => r[columnName(col)] = row[columnName(col)] );  return r; })
}
/**
* Main
*/
function SQLEngine(database){
    
  this.execute = function(query){
    const tokens = tokenizing(query);
    const q = parse(tokens);
    return engine(database, q);
  }
  
}
