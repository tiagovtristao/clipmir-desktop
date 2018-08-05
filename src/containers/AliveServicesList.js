import { connect } from 'react-redux';
import List from '../components/List';
import { connectToService } from '../server';

const mapStateToProps = ({ aliveServices, establishedConnections }) => ({
  emptyListText: 'As soon as a device comes alive, it will be displayed here.',
  list: Object.values(aliveServices).map(aliveService => ({
    ...aliveService,
    active: establishedConnections.includes(aliveService.id), // Whether there's a connection or not
  })),
});

const mapDispatchToProps = () => ({
  onItemClick(id) {
    connectToService(id);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(List);
