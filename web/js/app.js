App = {
  web3Provider: null,
  contracts: {},
  contractInstance: null,
  init: function() {
    $.getJSON('http://localhost:8000/TicketSale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TicketSaleArtifact = data;
      App.contracts.TicketSale = TruffleContract(TicketSaleArtifact);
      // Set the provider for our contract.
      App.contracts.TicketSale.setProvider(App.web3Provider);
      // Use our contract to retieve and mark the adopted pets.
      App.contracts.TicketSale.defaults({from: "0x6a9641990d49089118f8e35e0557ff3e1245f85d",
                                         gas: 1000000});

      App.contracts.TicketSale.deployed().then(function(instance){
        App.contractInstance = instance;
        App.enumerateConcerts(instance, 0);
      });
    });

    return App.initWeb3();
  },
  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (false && typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
      App.web3Provider = web3.currentProvider;

      console.log('1');
    } else {
      // set the provider you want from Web3.providers
      web3 = new Web3(App.web3Provider);
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      console.log('2');
    }
    return App.initContract();
  },
  initContract: function() {
    return App.bindEvents();
  },
  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.buyTicket);
    $(document).on('click', '.btn-createConcert', App.createConcert);
    $(document).on('click', '.btn-checkTicket', App.checkTicket);
  },
  enumerateConcerts: function(instance, id) {
    instance.getConcertData.call(id).then(function(result){
      var concertRow = $('#concertsRow');
      var concertTemplate = $('#concertTemplate');
  
      concertTemplate.find('.panel-title').text(result[0]);
      concertTemplate.find('.concert-id').text(id);
      concertTemplate.find('.concert-band').text(result[0]);
      concertTemplate.find('.concert-totalTickets').text(result[1]);
      concertTemplate.find('.concert-soldTickets').text(result[2]);
      concertTemplate.find('.btn-buy').attr('data-id', id);;
      
      concertRow.append(concertTemplate.html());      

      App.enumerateConcerts(instance, id + 1);
    });
  },
  buyTicket: function() {
    event.preventDefault();
    var concertId = parseInt($(event.target).data('id'));
    var buyer = document.getElementById("buyer").value;
    App.contractInstance.sellTickets(concertId, 1, buyer);
  },
  createConcert: function() {
    var bandName = document.getElementById("newConcert-bandName").value;
    var totalTickets = document.getElementById("newConcert-totalTickets").value;
    App.contractInstance.createConcert(bandName, totalTickets);    
  },
  checkTicket: function(){
    var concertId = document.getElementById("check-concertId").value;
    var buyer = document.getElementById("check-buyer").value;
    App.contractInstance.hasTicket.call(concertId, buyer).then(function(result){
      var button = document.getElementById("btn-checkTicket");
      if (result){
        button.style.backgroundColor = "#00ff00";
      }
      else{
        button.style.backgroundColor = "#ff0000";
      }
    });    
  }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
