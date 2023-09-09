import React from "react";
import Screen from "./screen.js";
import Button from "./button.js";

/*************************************************
 *
 * Logic for converting formula into postfix array
 *
*************************************************/

// Array to hold operators
const operators = ['#'];

// Index for referencing operators array
let opIndex = 0;

function raiseAlert() {
  return "Cannot read formula";
}

// Function to push operators into array
function push(op) {
  opIndex++;
  operators[opIndex] = op;
}

// Function to get last operator
function pop() {
  const popped = operators[opIndex];
  opIndex--;
  return popped;
}

// Function to check if element is an operator
function operator(element) {
	if (element === '+' || element === '-' ||
		  element === '^' || element === '*' ||
		  element === '/' || element === '(' ||
		  element === ')') {
    
		return true;
	}
	else
		return false;
}

// Function to check precedence
function precedence(op) {
	if (op === '#' || op === '(' || op === ')') {
		return 1;
	}
	else if (op === '+' || op === '-') {
		return 2;
	}
	else if (op === '/' || op === '*') {
		return 3;
	}
	else if (op === '^') {
		return 4;
	}
	else
		return 0;
}

// function to check if formula parentheses are valid
function validateParentheses(formula) {
  let openParentheses = 0;

  for (const element of formula) {
    if (element === '(') { openParentheses++ }
    else if (element === ')' && openParentheses) { openParentheses-- }
    else if (element === ')' && openParentheses === 0) { return false }
  }
   
  return openParentheses === 0 ? true : false;
}

function convertToPostfix(formula) {
  const postfix = [];
  let idx = 0;
  
  // Make sure numbers are included and validate parentheses
  if (!validateParentheses(formula)) {
    return raiseAlert();
  }
  
  // If formula has pattern operator, minus, opening parenthesis, multiply next operation by -1 instead
  // Ex: 8 + - (3) => 8 + (-1 * (3))
  while (/[+*-/]-\(/.test(formula)) {
    // Find index of match
    let idx = formula.search(/[+*-/]-\(/);
    let openParentheses = 1;
    // Since starting with 1 open parenth, move count index past the first one
    let count = idx + 3;
    // Search for 
    while (openParentheses !== 0) {
        let element = formula[count];
        if (element === ')') {
            openParentheses--;
        }
        else if (element === '(') {
            openParentheses++;
        }
        count++;
    }
    
    formula = formula.slice(0, count) + ')' + (formula.slice(count));
    formula = formula.slice(0, idx + 1) + '(-1*' + (formula.slice(idx + 2));
  }
  
  // Separate formula into an array of numbers and operators
  const infix = formula.split(/(?<=[-+*/()^])|(?=[-+*/()^])/);
  
  // Iterate over array
  for (let i = 0; i < infix.length; i++) {
    const element = infix[i];
    let prevElement;
    let nextElement;
    
    // Determine if - is for subtraction or negation
    if (element === '-') {
      if (infix[i - 1]) { prevElement =  infix[i - 1]}
      if (infix[i + 1]) { nextElement =  infix[i + 1]}
      
      // If first element is - then next number is negative
      if (infix[0] === '-') {
        // Add negative sign to next number
        infix[1] = '-' + infix[1];
        // First '-' is no longer needed
        infix.shift();
        // Removed item, so decrement i
        i--;
        continue;
      }
      // If - is preceded by an operator, next number is negative
      else if (prevElement && nextElement && /^[-*+/^(]$/.test(prevElement)) {
        // Add negative sign to next number
        infix[i + 1] = '-' + infix[i + 1];
        // Previous '-' no longer needed
        infix.splice(i, 1);
        // Removed item, so decrement i
        i--;
        continue;
      }
    }
    
    // Check if element is an operator
    if (operator(element)) {
      // If opening brace, add to operators array
      if (element === '(') {
        // If prev element was number or closing parenth, add asterisk for multiplying
        if (/[\d)]/.test(infix[i - 1])) {
            push('*');
        }
        push(element);
      }
      // If closing brace, add operators to postfix
      else if (element === ')') {
        while (operators[opIndex] !== "(") {
					postfix[idx++] = pop();
				}
				opIndex--;
      }
      // If element is not parentheses, check precedence to previous operator
      else if (precedence(element) <= precedence(operators[opIndex])) {
        // While precedence is lower, add operators to postfix
        while (precedence(element) <=
					precedence(operators[opIndex]) && opIndex >= 0) {
					postfix[idx++] = pop();
				}
				push(element);
      }
      // If precedence is greater, add operator to array
      else {
        push(element);
      }
    }
    
    // If element is a number, add to postfix
    else {
      postfix[idx++] = element;
    }
  }
  // Add operators to postfix
  while (operators[opIndex] !== '#') {
    postfix[idx++] = pop();
  }
  
  return postfix;
}

/*************************************************
 *
 * Logic for calculating answer from postfix array
 *
 *************************************************/

// Function to get number of decimals to round to for floating point math
function getDigits(nums) {
  // Split each number to find length of decimals, then return longest length
  return Math.max(...nums.map(num => num.toString().split('.')[1].length))
}

// Function to verify that operands are numbers
function checkNumbers(nums) {
  if (typeof nums[0] === 'number' && typeof nums[1] === 'number') {
    return true;
  }
  return false;
}

// Function to calculate formula from postfix notation
function calculate(postfix) {
  // Operators for perfmorning calculations
  const operators = {
    '+': (num1, num2) => num1 + num2,
    '-': (num1, num2) => num1 - num2,
    '*': (num1, num2) => num1 * num2,
    '/': (num1, num2) => num1 / num2,
    '^': (num1, num2) => Math.pow(num1, num2)
  }
  // Stack to hold results
  const stack = [];
  // Iterate over postfix array
  for (const element of postfix) {
    // If element is an operator, get last two nums from stack and get result
    if (element in operators) {
      const nums = stack.splice(-2);
      if (!checkNumbers(nums)) { return raiseAlert() }
      // If both numbers are floats, get number of digits and format result. Else operate as normal
      nums[0] % 1 !== 0 && nums[1] % 1 !== 0 ? stack.push(+operators[element](...nums).toFixed(getDigits(nums)))
                                           : stack.push(operators[element](...nums));
    }
    else {
      // Else convert element to number and push to stack
      stack.push(+element);
    }
  }
  return stack[0];
}


class Calculator extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        answer: '',
        formula: '0',
        currNum: '0',
        opChain: ''
      }
      this.handleClick = this.handleClick.bind(this);
      this.handleInputWithInit = this.handleInputWithInit.bind(this);
      this.handleInputWithFormula = this.handleInputWithFormula.bind(this);
      this.handleClearAll = this.handleClearAll.bind(this);
      this.handleClearEntry = this.handleClearEntry.bind(this);
      this.handleNegateValue = this.handleNegateValue.bind(this);
      this.handleGetAnswer = this.handleGetAnswer.bind(this);
    }
    
    handleInputWithInit(val, answer, formula, currNum) {
      // Reset if prev answer was error, setting calc back to init state
      if (answer) { this.setState({ answer: '' }) }
      
      // If 0 is first entry, nothing happens
      if (val === '0') { return }
      
      // If . is first entry, place it after the init 0
      else if (val === '.') { this.setState({ formula: formula + val, currNum: currNum + val }) }
      
      // If parenthesis is first entry, update formula and reset currNum
      else if (/[()]/.test(val)) { this.setState({ formula: val, currNum: '' }) }
      
      // If operator is first entry, place it after the init 0
      else if (/[-*+/^]/.test(val)) { this.setState({ formula: formula + val, currNum: '', opChain: val }) }
      
      // Otherwise, update to chosen input
      else { this.setState({ formula: val, currNum: val }) }
    }
    
    handleInputWithFormula(val, answer, formula, currNum, opChain) {
      // Operator following = should start a new calculation that operates on the result of the previous evaluation
      if (answer !== '' && answer === currNum) {
        if (/[+*-/^]/.test(val))
          { this.setState({ answer: '', formula: answer + val, currNum: '', opChain: val }) }
        return;
      }
      // If opChain is [+-/*]-, next number is negated.
      // This ensures accurate currNum
      if (opChain.length >= 2 && formula[formula.length - 1] === '-' && /[\d]/.test(val)) { 
        // Negate val
        val = (val * -1).toString();
        // Update formula, minus sign no longer needed
        formula = formula.slice(0, -1);
        this.setState({ formula: formula.slice(0, -1), opChain: '' });
      };
      
      // Prevent multiple decimals in one number if currNum already has a decimal
      if (val === '.' && /[.]/.test(currNum)) { return }
      
      // Prevent number beginning with multiple 0's
      // If currNum starts with 0, replace last value instead of appending
      // But allow multiple 0's after decimal and do not replace if val is a decimal
      else if (currNum[0] === '0' && currNum[1] !== '.' && val !== '.') 
        { this.setState({ formula: formula.slice(0, -1) + val, currNum: val }) }
      
      else if (val === '(') { this.setState({ formula: formula + val, currNum: '' }) }
      
      // Don't clear currNum on closing parenthesis
      else if (val === ')') { this.setState({ formula: formula + val}) }
      
      // If val is an operator
      else if (/^[-+*/^]$/.test(val)) {
        // Longest valid chain is 2 operators, and no operators except - after parentheses
        if (opChain.length >= 2) { return }
        
        // Prevent invalid operator chain. If length is 1, then previous entry was an operator. If next operator is 
        //not -, then chaining is invalid. Do not replace parentheses.
        else if (opChain.length === 1 && val !== '-' && !/[()]/.test(formula[formula.length - 1]))
          // Update to latest operator entry and reset opChain
          { this.setState({ formula: formula.slice(0, -1) + val, opChain: val }) }
        
        else { this.setState({ formula: formula + val, currNum: '', opChain: opChain + val }) }
      }
      
      // If val is a number
      else {
        this.setState({ formula: formula + val, currNum: currNum + val, opChain: '' });
      }
    }
    
    handleClearAll() {
      this.setState({ answer: '', formula: '0', currNum: '0', opChain: '' });
    }
    
    handleClearEntry(formula, currNum, opChain) {
      // Only delete if formula is built
      if (formula.length > 1) {
        // Remove last entry and update currNum
        this.setState({ formula: formula.slice(0, -1), currNum: currNum.slice(0, -1) });
        // If a number is deleted and leaves operators at the end, opChain needs to be updated
        if (/[-+*/^]$/.test(formula[formula.length - 2])) {
          opChain = formula.slice(0, -1).match(/([-+/*]-?)$/g).join();
          this.setState({ opChain: opChain });
        }
  
        // If deleted item is operator, opChain needs to be updated
        const deletedItem = formula[formula.length - 1];
        if (/[-+*/^(]$/.test(deletedItem)) {
          if (deletedItem === '(') {
            this.setState({ opChain: formula[formula.length - 1] })
          }
          else {
            // Since we are moving backwards, opChain needs to be recaptured
            opChain = formula.match(/([-+/*]-*)$/g).join();
            this.setState({ opChain: opChain.slice(0, -1) });
          }
        }
      }
      // Reset if everything is deleted
      else {
        this.setState({ formula: '0' });
      }
    }
    
    handleNegateValue(answer, formula, currNum) {
      let newNum;
      // If after a calculation, negate answer instead of currNum
      if (answer) {
        newNum = (answer * -1).toString();
        this.setState({ answer: '', formula: newNum, currNum: newNum })
      }
      // Only change if there is a current number
      else if (currNum && !answer) {
        // Get negation of current number
        newNum = (currNum * -1).toString();
        // Replace number with negated number and update currNum
        // Regex matches currNum
        this.setState({ formula: formula.replace(/(?<=^[()]*|\d[()]|[+*-/][()]*)-*[\d]+(?=[()]*$)/, newNum),
                        currNum: newNum});
      }
    }
    
    handleGetAnswer(formula) {
      const postfix = convertToPostfix(formula);
      if (postfix === 'Cannot read formula') { return postfix }
      
      const ans = calculate(postfix);
      if (ans === 'Cannot read formula') 
        { this.setState({ answer: ans, formula: '0', opChain: '' }) }
      else 
        { this.setState({ answer: ans, currNum: ans, opChain: '' }) }
    }
    
    handleClick(event) {
      let val = event.target.value;
      let answer = this.state.answer;
      let formula = this.state.formula;
      let currNum = this.state.currNum;
      let opChain = this.state.opChain;
  
      switch(val) {
        // Reset calculator to initialized state
        case "AC":
          this.handleClearAll();
          break;
        // Delete last input
        case "CE":
          this.handleClearEntry(formula, currNum, opChain);
          break;
        // Negate current number
        case "+/-":
          this.handleNegateValue(answer, formula, currNum);
          break;
        // Get final answer
        case "=":
          this.handleGetAnswer(formula);
          break;
        // Handle other inputs
        default:
          // If a formula is 0, calculator is in init state
          formula === '0' ? this.handleInputWithInit(val, answer, formula, currNum)
                          : this.handleInputWithFormula(val, answer, formula, currNum, opChain);
      }
    }    
    
    render() {
      return (
        <div id="calculator">
          <Screen formula={this.state.formula} answer={this.state.answer}/>
          
          <Button id="clear-all" className="button double" label={"AC"} handleClick={this.handleClick}/>
          <Button id="clear-entry" className="button" label={"CE"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"+/-"} handleClick={this.handleClick}/>
          
          <Button className="button operator" label={"("} handleClick={this.handleClick}/>
          <Button className="button operator" label={")"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"^"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"/"} handleClick={this.handleClick}/>
          
          <Button className="button number" label={"7"} handleClick={this.handleClick}/>
          <Button className="button number" label={"8"} handleClick={this.handleClick}/>
          <Button className="button number" label={"9"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"*"} handleClick={this.handleClick}/>
          
          <Button className="button number" label={"4"} handleClick={this.handleClick}/>
          <Button className="button number" label={"5"} handleClick={this.handleClick}/>
          <Button className="button number" label={"6"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"-"} handleClick={this.handleClick}/>
          
          <Button className="button number" label={"1"} handleClick={this.handleClick}/>
          <Button className="button number" label={"2"} handleClick={this.handleClick}/>
          <Button className="button number" label={"3"} handleClick={this.handleClick}/>
          <Button className="button operator" label={"+"} handleClick={this.handleClick}/>
          
          <Button className="button number" label={"0"} handleClick={this.handleClick}/>
          <Button className="button" label={"."} handleClick={this.handleClick}/>
          <Button id="equals" className="button double" label={"="} handleClick={this.handleClick}/>
        </div>
      );
    }
  }

  export default Calculator;