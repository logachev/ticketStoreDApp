App = {
  web3: null,
  web3Provider: null,
  contracts: {},
  contractInstance: null,
  defaultAccount: "",
  accounts: [],

  init: function () {
    App.initWeb3();
    App.bindEvents();
  },

  initWeb3: function () {
    // Configure web3 provider. Use private testrpc address in this example.
    App.web3 = new Web3(App.web3Provider);
    App.web3Provider = new App.web3.providers.HttpProvider('http://localhost:8545');
    App.web3.setProvider(App.web3Provider);

    // Read 'default' account data. In this example we use 'default' account as ticket issuing account.
    App.web3.eth.getAccounts(function (error, result) {
      if (!error) {
        defaultAccount = result[0];
        accounts = result;

        // Configure accounts drop down menu
        ['select-accounts', 'resell-buyer', 'resell-seller'].forEach(function (menu) {
          var selectMenu = document.getElementById(menu);
          accounts.forEach(function (item) {
            var option = document.createElement("option");
            option.text = item;
            selectMenu.appendChild(option);
          });
        });

        App.initContract();
      }
    });
  },

  initContract: function () {
    $.getJSON('http://localhost:8000/TicketSale.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.TicketSale = TruffleContract(data);
      // Set the provider for our contract.
      App.contracts.TicketSale.setProvider(App.web3Provider);
      // Use our contract to retieve and mark the adopted pets.
      App.contracts.TicketSale.defaults({
        from: defaultAccount,
        gas: 1000000
      });

      App.contracts.TicketSale.deployed().then(function (instance) {
        App.contractInstance = instance;
        App.loadConcerts();
      });
    });
  },

  loadConcerts: function () {
    App.contractInstance.getConcertCount.call().then(function (count) {
      for (id = 0; id < count; id++) {
        App.loadConcert(id);
      }
    });
  },
  loadConcert: function (id) {
    App.contractInstance.getConcertData.call(id).then(function (result) {
      var concertRow = $('#concertsRow');
      var concertTemplate = $('#concertTemplate');

      concertTemplate.find('.panel-title').text(result[0]);
      concertTemplate.find('.concert-id').text(id);
      concertTemplate.find('.concert-band').text(result[0]);
      concertTemplate.find('.concert-totalTickets').text(result[1]);
      concertTemplate.find('.concert-soldTickets').text(result[2]);
      concertTemplate.find('.btn-buy').attr('data-id', id);;

      concertRow.append(concertTemplate.html());
    });
  },

  bindEvents: function () {
    $(document).on('click', '.btn-buy', App.buyTicket);
    $(document).on('click', '.btn-createConcert', App.createConcert);
    $(document).on('input', '.check-concertId', App.checkTicket);
    $(document).on('change', '.select-accounts', App.checkTicket);
    $(document).on('click', '.btn-resellTickets', App.resellTickets);
  },
  buyTicket: function () {
    event.preventDefault();
    var concertId = parseInt($(event.target).data('id'));
    var buyer = document.getElementById("select-accounts").value;
    console.log(typeof (buyer));
    App.contractInstance.sellTickets(concertId, 1, buyer);
  },
  createConcert: function () {
    var bandName = document.getElementById("newConcert-bandName").value;
    var totalTickets = document.getElementById("newConcert-totalTickets").value;
    App.contractInstance.createConcert(bandName, totalTickets);
  },
  checkTicket: function () {
    var concertId = document.getElementById("check-concertId").value;
    var buyer = document.getElementById("select-accounts").value;
    App.contractInstance.getTotalTicketsByOwnerForConcert.call(concertId, buyer).then(function (result) {
      var label = document.getElementById("check-totalTickets");
      label.innerHTML = result;
    });
  },
  resellTickets: function () {
    var concertId = document.getElementById("resell-concertId").value;
    var seller = document.getElementById("resell-seller").value;
    var buyer = document.getElementById("resell-buyer").value;
    var numOfTicket = document.getElementById("resell-numOfTickets").value;

    App.contractInstance.resellTicket(concertId, buyer, numOfTicket, { from: seller }).then(function (result) {
      var button = document.getElementById("btn-resellTickets");
      if (result) {
        button.style.backgroundColor = "#00ff00";
      }
      else {
        button.style.backgroundColor = "#ff0000";
      }
    });
  }
};
$(function () {
  $(window).load(function () {
    App.init();
  });
});
