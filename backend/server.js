const express = require('express');
const bodyParser = require('body-parser');
const readline = require('readline');

// Import the IntermediateCodeGenerator class
class IntermediateCodeGenerator {
    constructor() {
        this.tempCount = 0;
        this.instructions = [];
    }

    newTemp() {
        return `t${this.tempCount++}`;
    }

    generateBinaryOperation(op, left, right) {
        const temp = this.newTemp();
        this.instructions.push(`${temp} = ${left} ${op} ${right}`);
        return temp;
    }

    generateExpression(node) {
        if (typeof node === 'number') {
            return node.toString();
        }
        const leftCode = this.generateExpression(node.left);
        const rightCode = this.generateExpression(node.right);
        return this.generateBinaryOperation(node.operator, leftCode, rightCode);
    }

    parseExpression(expression) {
        const tokens = this.tokenize(expression);
        return this.parseTokens(tokens);
    }

    tokenize(expr) {
        const regex = /\d+|[+\-*/()]|\s+/g;
        return expr.match(regex).filter(token => !token.match(/\s+/));
    }

    parseTokens(tokens) {
        const outputQueue = [];
        const operatorStack = [];
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2
        };

        const associativity = {
            '+': 'L',
            '-': 'L',
            '*': 'L',
            '/': 'L'
        };

        const isOperator = (token) => ['+', '-', '*', '/'].includes(token);
        const isLeftParenthesis = (token) => token === '(';
        const isRightParenthesis = (token) => token === ')';

        tokens.forEach(token => {
            if (!isNaN(token)) {
                outputQueue.push({ type: 'number', value: Number(token) });
            } else if (isOperator(token)) {
                while (operatorStack.length && isOperator(operatorStack[operatorStack.length - 1])) {
                    const topOperator = operatorStack[operatorStack.length - 1];
                    if ((associativity[token] === 'L' && precedence[token] <= precedence[topOperator]) ||
                        (associativity[token] === 'R' && precedence[token] < precedence[topOperator])) {
                        outputQueue.push({ type: 'operator', value: operatorStack.pop() });
                    } else {
                        break;
                    }
                }
                operatorStack.push(token);
            } else if (isLeftParenthesis(token)) {
                operatorStack.push(token);
            } else if (isRightParenthesis(token)) {
                while (operatorStack.length && !isLeftParenthesis(operatorStack[operatorStack.length - 1])) {
                    outputQueue.push({ type: 'operator', value: operatorStack.pop() });
                }
                operatorStack.pop();
            }
        });

        while (operatorStack.length) {
            outputQueue.push({ type: 'operator', value: operatorStack.pop() });
        }

        const stack = [];
        outputQueue.forEach(token => {
            if (token.type === 'number') {
                stack.push(token.value);
            } else if (token.type === 'operator') {
                const right = stack.pop();
                const left = stack.pop();
                stack.push({ left, operator: token.value, right });
            }
        });

        return stack[0];
    }

    generate(inputExpression) {
        const result = this.generateExpression(inputExpression);
        this.instructions.push(`${result}`);
        return this.instructions;
    }
}

// Express app setup
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// API endpoint to handle expression and generate intermediate code
app.post('/generate', (req, res) => {
    const { expression } = req.body;
    const generator = new IntermediateCodeGenerator();
    
    try {
        const parsedExpression = generator.parseExpression(expression);
        const intermediateCode = generator.generate(parsedExpression);
        res.json({ code: intermediateCode });
    } catch (error) {
        res.status(500).json({ error: 'Error generating intermediate code' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
