Template._customerItem.helpers({
  totalValue: function() {
    return accounting.formatMoney(this.totalValue); 
  },
  balance: function() {
    return accounting.formatMoney(this.balance); 
  }
});
