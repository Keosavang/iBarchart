

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
        Bars.update({_id: Session.get('currentBar')}, {score: e.target.value});
      }
    },
    'keyup #adding-score': function(e, t) {
      if (e.which === 13) {
        Bars.insert({score: e.target.value});
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

      xScale.domain([0, d3.max(dataset, function(d) { return d.score; })]);

      var bar = svg.selectAll('rect')
        .data(dataset, key);

        bar.enter()
          .append('rect')
            .attr('transform', function(d, i) {
                return 'translate(0, '+ i * barHeight +')';
            })          
            .attr('width', function(d) { return xScale(d.score); })
            .attr('height', barHeight - 1)
            .attr('data-id', function(d) { return d._id; })
            .style('fill', 'steelblue')
            .on('mouseover', function() {
              d3.select(this)
                .style('fill', 'orange');
            })
            .on('mouseout', function() {
              d3.select(this)
                .style('fill', 'steelblue');
            });          

        bar.transition()
          .duration(500)
          .attr('transform', function(d, i) {
                return 'translate(0, '+ i * barHeight +')';
            })
          .attr('width', function(d) { return xScale(d.score); })

          bar.exit()
            .remove();

        var label = svg.selectAll('text')
          .data(dataset, key)

        label.enter()
          .append('text')
          .attr('x', function(d) { return xScale(d.score) - 18; })
          .attr('y', function(d, i) { return (i * barHeight) + barHeight / 2; })
          .attr('dy', '.35em')
          .style('font-size', '10px')
          .text(function(d) { return d.score; });       

        label.transition()
          .duration(500)
          .attr('x', function(d) { return xScale(d.score) - 18; })
          .attr('y', function(d, i) { return (i * barHeight) + barHeight / 2; })
          .attr('dy', '.35em')
          .text(function(d) { return d.score; });

        label.exit().remove();

    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
