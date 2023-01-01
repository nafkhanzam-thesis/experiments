import os
from dotenv import load_dotenv
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

load_dotenv()
SCYLLA_DB_HOST = os.getenv("SCYLLA_DB_HOST")
SCYLLA_DB_USER = os.getenv("SCYLLA_DB_USER")
SCYLLA_DB_PASSWORD = os.getenv("SCYLLA_DB_PASSWORD")
SCYLLA_DB_KEYSPACE = os.getenv("SCYLLA_DB_KEYSPACE")
SCYLLA_DB_TABLE = os.getenv("SCYLLA_DB_TABLE")

cluster = Cluster(
    [SCYLLA_DB_HOST],
    auth_provider=PlainTextAuthProvider(
        username=SCYLLA_DB_USER,
        password=SCYLLA_DB_PASSWORD
    )
)
session = cluster.connect()
session.set_keyspace(SCYLLA_DB_KEYSPACE)
