var budgetModule = (function () {
  class budgetElement {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  class Income extends budgetElement {
    constructor(id, description, value) {
      super(id, description, value);
    }
  }

  class Expense extends budgetElement {
    constructor(id, description, value, percentage = -1) {
      super(id, description, value);
    }

    calcPercent() {
      if (data.totals.inc > 0) {
        this.percentage = Math.round((this.value / data.totals.inc) * 100);
      } else {
        this.percentage = -1;
      }
    }

    getPercent() {
      return this.percentage;
    }
  }

  var data = {
    items: {
      inc: [],
      exp: [],
    },

    totals: {
      inc: 0,
      exp: 0,
    },

    budget: 0,
    expPercent: -1,
  };

  return {
    addItem: function (type, desc, value) {
      var newItem, id;

      if (data.items[type].length > 0) {
        id = data.items[type][data.items[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      if (type === 'inc') {
        newItem = new Income(id, desc, value);
      } else {
        newItem = new Expense(id, desc, value);
      }

      data.items[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var indexArray, indexID;

      indexArray = data.items[type].map(function (current) {
        return current.id;
      });

      indexID = indexArray.findIndex((current) => current === id);

      if (indexID !== -1) {
        data.items[type].splice(indexID, 1);
      }
    },

    calculateBudget: function () {
      this.calculateTotal('inc');
      this.calculateTotal('exp');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.expPercent = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.expPercent = -1;
      }
    },

    calculateTotal: function (type) {
      var sum = 0;

      data.items[type].forEach((current) => (sum += current.value));

      data.totals[type] = sum;
    },

    getBudget: function () {
      return data;
    },

    calculatePercentages: function () {
      data.items.exp.forEach(function (current) {
        current.calcPercent();
      });
    },

    getPercentages: function () {
      var allPercentages = data.items.exp.map(function (current) {
        return current.getPercent();
      });

      return allPercentages;
    },
  };
})();

var uiModule = (function () {
  // HTML strings
  var inputStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeList: '.income__list',
    expenseList: '.expenses__list',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expenseValue: '.budget__expenses--value',
    percentValue: '.budget__expenses--percentage',
    container: '.container',
    expensePercentLabel: '.item__percentage',
    date: '.budget__title--month',
  };

  var formatNumber = function (number, type) {
    var num, integer, decimal;

    num = Math.abs(number);
    num = num.toFixed(2);
    num = num.split('.');

    integer = num[0];
    decimal = num[1];

    if (integer.length > 3) {
      integer = `${integer.substr(0, integer.length - 3)},${integer.substr(integer.length - 3, 3)}`;
    }

    return `${type === 'exp' ? '-' : '+'} ${integer}.${decimal}`;
  };

  return {
    getDOMstrings: function () {
      return inputStrings;
    },

    getInputs: function () {
      return {
        type: document.querySelector(inputStrings.inputType).value,
        description: document.querySelector(inputStrings.inputDescription).value,
        value: document.querySelector(inputStrings.inputValue).value,
      };
    },

    addListItem: function (item, type) {
      var element, htmlString, newHTML;

      if (type === 'inc') {
        element = inputStrings.incomeList;

        htmlString =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="bx bx-x"></i></button></div></div></div>';
      } else {
        element = inputStrings.expenseList;

        htmlString =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="bx bx-x"></i></button></div></div></div>';
      }

      newHTML = htmlString.replace('%id%', item.id);
      newHTML = newHTML.replace('%description%', item.description);
      newHTML = newHTML.replace('%value%', formatNumber(item.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function (id) {
      element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },

    clearFields: function () {
      document.querySelector(inputStrings.inputDescription).value = '';
      document.querySelector(inputStrings.inputValue).value = '';

      document.querySelector(inputStrings.inputDescription).focus();
    },

    displayBudget: function (budget, totalInc, totalExp, expPercent) {
      var type;

      if (totalInc >= totalExp) {
        type = 'inc';
      } else {
        type = 'exp';
      }

      document.querySelector(inputStrings.budgetValue).textContent = formatNumber(budget, type);

      document.querySelector(inputStrings.incomeValue).textContent = formatNumber(totalInc, 'inc');
      document.querySelector(inputStrings.expenseValue).textContent = formatNumber(totalExp, 'exp');
      if (expPercent !== -1) {
        document.querySelector(inputStrings.percentValue).textContent = expPercent + '%';
      } else {
        document.querySelector(inputStrings.percentValue).textContent = '---';
      }
    },

    displayPercentages: function (percentsArray) {
      var fields;

      fields = document.querySelectorAll(inputStrings.expensePercentLabel);

      fieldsArr = Array.from(fields);

      fieldsArr.forEach((current, index) => {
        if (percentsArray[index] > 0) {
          current.textContent = percentsArray[index] + '%';
        } else {
          current.textContent = '<1%';
        }
      });
    },

    displayMonth: function () {
      var date, year, months, currMonth;

      date = new Date();
      year = date.getFullYear();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      currMonth = months[date.getMonth()];

      document.querySelector(inputStrings.date).textContent = `${currMonth} ${year}`;
    },

    changeType: function () {
      var fields;

      fields = document.querySelectorAll(
        inputStrings.inputType + ',' + inputStrings.inputDescription + ',' + inputStrings.inputValue
      );

      fieldsArr = Array.from(fields);

      fieldsArr.forEach((current) => current.classList.toggle('red-focus'));

      document.querySelector(inputStrings.inputButton).classList.toggle('red');
    },
  };
})();

var mainModule = (function (budget, ui) {
  var setupEventListeners = function () {
    var domStrings = ui.getDOMstrings();

    // Click check button
    document.querySelector(domStrings.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(domStrings.inputType).addEventListener('change', ui.changeType);

    document.querySelector(domStrings.container).addEventListener('click', ctrlDeleteItem);
  };

  var ctrlAddItem = function () {
    var inputs, item;

    inputs = ui.getInputs();

    if (!isNaN(inputs.value) && inputs.value > 0 && inputs.description !== '') {
      item = budget.addItem(inputs.type, inputs.description, parseFloat(inputs.value));

      ui.addListItem(item, inputs.type);

      ui.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var id, splitArray, type, idNum;

    id = event.target.parentNode.parentNode.parentNode.parentNode.id;

    splitArray = id.split('-');

    type = splitArray[0];
    idNum = splitArray[1];

    budget.deleteItem(type, parseInt(idNum));

    ui.deleteListItem(id);

    updateBudget();

    updatePercentages();
  };

  var updateBudget = function () {
    budget.calculateBudget();
    var budgetData = budget.getBudget();

    ui.displayBudget(
      budgetData.budget,
      budgetData.totals.inc,
      budgetData.totals.exp,
      budgetData.expPercent
    );
  };

  var updatePercentages = function () {
    budget.calculatePercentages();
    var allPercentages = budget.getPercentages();

    ui.displayPercentages(allPercentages);
  };

  return {
    init: function () {
      //Event listeners
      setupEventListeners();
      ui.displayBudget(0, 0, 0, -1);
      ui.displayMonth();
    },
  };
})(budgetModule, uiModule);

mainModule.init();
