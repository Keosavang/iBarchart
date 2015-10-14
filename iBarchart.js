if (Meteor.isClient) {
  Bars = new Mongo.Collection(null);
  Bars.insert({score: 22});
  Bars.insert({score: 17});
  Bars.insert({score: 22});
  Bars.insert({score: 17});

  Template.dashboard.helpers({
    selected: function () {
      return Bars.findOne({_id: Session.get('currentBar')});
    }
  });

  Template.dashboard.events({
    'keyup #edited': function (e, t) {
      if (e.which === 13) {
        if (e.target.value >= 1) {
          Bars.update({_id: Session.get('currentBar')}, {score: e.target.value});
          e.target.value = null;
          Session.set('currentBar', null);         
        } else{
          e.target.value = Bars.findOne({_id: Session.get('currentBar')}).score;
        };
      }
    },
    'keyup #adding-score': function(e, t) {
      if(e.which === 13) {
        if (e.target.value >= 1) {
         Bars.insert({score: e.target.value});
         e.target.value = null;
        } else{
         e.target.value = null;
        };
      }
    },
    'click #removing': function() {
      Bars.remove({_id: Session.get('currentBar')});
    },

  });

  Template.barchart.events({
    'click rect': function (e, t) {
      var selectedBarId = $(e.currentTarget).data("id");
      Session.set('currentBar', selectedBarId);
    }
  });

  Template.barchart.onRendered(function() {
    var w = 600,
        h = 400,
        barHeight = 13;

    var xScale = d3.scale.linear()
      .range([0, w]);

    var key = function(d) { return d._id; };

    var svg = d3.select('#barChart')
      .attr('width', w)
      .attr('height', h);

    Tracker.autorun(function() {
      var dataset = Bars.find().fetch();

      xScale.domain([0, d3.max(dataset, function(d) { return d.score * 1; })]);

      svg.selectAll('g').remove();

      var bar = svg.selectAll('g').data(dataset, key);
              
        bar.enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function(d, i) {
              return 'translate(0, '+ i * barHeight +')';
          });
        bar.append('rect');
        bar.append('text');

        bar.exit().remove();

        bar.select('rect')
            .attr('width', function(d) { return xScale(d.score); })
            .attr('height', barHeight - 1)
            .attr('data-id', function(d) { return d._id; })
            .style('fill', function(d) {
              if(Session.get('currentBar') == d._id) {
                return 'orange';
              } else{
                return 'steelblue';
              }
            })
            .on('mousedown', function() {
              d3.selectAll('rect')
                .style('fill', 'steelblue');
              d3.select(this)
                .style('fill', function(d) {
                  if( d._id == Session.get('currentBar')) {
                    Session.set('currentBar', null);
                    return 'steelblue';
                  } else{
                    return 'orange';
                  }                  
                });
            });

        bar.select('text')
            .attr('x', function(d) { return xScale(d.score) - (Math.trunc(Math.log10(d.score)) * 5) - 15;})
            .attr('y', barHeight / 2)
            .attr('dy', '.35em')
            .style('font-size', '10px')
            .text(function(d) { return d.score; });

    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
