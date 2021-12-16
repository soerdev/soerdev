
let expression = '(C9194 < 999) && (D912 >= 100 || D111 != 0 && (C121 > 2)) && (C111 > 2)';

/**
*  Tokenizing
*/

const escapeRegexp = (value) => {
    switch(value) {
        case '||':
            return '\\|\\|';
        case '&&':
            return '\\&\\&';
        case '(':
        case ')':
            return '\\' + value;
    }
    return value;
}

const getLexeme = (source) =>{
    let tokens = [];
  
    const templates = {
      keyword: /^(?:AVG|MAX)\b/i,
      number: /^-?\d+(?:\.\d+)?/,
      punct: /^[.,]/,
      param: /^[0-9A-Za-z_]+/,
      blocks: /^(?:\(|\))/,
      logic: /^(?:\|\||\&\&)/,
      cmp: /^(?:<=|>=|<>|<|>|==|!=)/,
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
        source = source.replace(new RegExp('^' + escapeRegexp(token.value), 'i'), '').trim();
        if(token.type == 'keyword') token.value = token.value.toUpperCase();

        tokens.push(token);
    }
    return tokens;
  }


  parse = (tokens) => {
    let list = [];

    const error = (msg) => { throw(new Error(msg)); }
    const peek = () => tokens[0] || {};
    const get = () => tokens.shift();
    const accept = (...tokens) => tokens.includes(peek().value);
    const acceptType = (...types) => types.includes(peek().type);

   
    let subExpression = () => {
        let result = [];

        if (acceptType('number', 'param')) {
            result.push(get());
        }

        if (acceptType('cmp')) {
            result.push(get());
        }

        if (acceptType('number', 'param')) {
            result.push(get());
        }
        return result.length ? result : null;
    }


    let tmp = null;
    let exp = null;
    if (accept('(')) { get(); tmp = {type: 'block', items: parse(tokens)};
    } else if(accept(')')) { get();  return [];
    } else if (exp = subExpression()) { tmp = {type: 'exp', exp: exp}; 
    } else if (acceptType('logic')) { tmp = get(); }

    if (tokens.length == 0) {
        return [tmp];
    }

    if (tmp === null) {
        error('Parse error at ' + tokens[0].value);
    }
    return [tmp, ...parse(tokens)];
  }

  let printTree = (ast, prefix = '') => {
      if (typeof(ast) !== 'string' && ast.length > 0) {
        let result = '';
        ast.forEach(el => result += printTree(el, prefix));
        return result;
      }

      if (ast.type === 'block') {
          return (prefix + '(') + "\n" + printTree(ast.items, prefix + '  ')  + (prefix + ')') + "\n";
      }

      if (ast.type === 'exp') {
          return (prefix + ast.exp.map(el => el.value).join(' ')) + "\n";
      }

      if (ast.type === 'logic') {
        return (prefix + ast.value) + "\n";
    }

      return (prefix + '=>', ast.type) + "\n";
  }

console.log(printTree(parse(tokenizing(expression))));